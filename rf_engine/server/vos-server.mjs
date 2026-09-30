// VOS local backend — zero dependencies (pure Node.js, needs Node 18.15+)
// Run: node rf_engine/server/vos-server.mjs

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { URL } from "node:url";

const PORT = 4000;

const ROOT = path.resolve(
  process.env.VOS_ROOT || os.homedir()
);

// Detect the real Windows Desktop folder.
// OneDrive Desktop is checked first.
const DESKTOP_CANDIDATES = [
  path.join(os.homedir(), "OneDrive", "Desktop"),
  path.join(os.homedir(), "Desktop"),
];

let DESKTOP_ROOT = path.join(os.homedir(), "Desktop");

for (const candidate of DESKTOP_CANDIDATES) {
  try {
    const stat = await fs.stat(candidate);

    if (stat.isDirectory()) {
      DESKTOP_ROOT = path.resolve(candidate);
      break;
    }
  } catch {}
}

const MAX_READ = 1024 * 1024;

/**
 * Resolve a VOS virtual path to the real filesystem path.
 *
 * Desktop/... is mapped to the user's actual Windows Desktop.
 * Everything else stays inside ROOT.
 */
const safe = (rel = "") => {
  const normalized = String(rel).replaceAll("\\", "/");

  // Virtual Desktop path -> real Windows Desktop
  if (
    normalized === "Desktop" ||
    normalized.startsWith("Desktop/")
  ) {
    const desktopRel = normalized.replace(/^Desktop\/?/, "");

    const full = path.resolve(
      DESKTOP_ROOT,
      desktopRel
    );

    if (
      full !== DESKTOP_ROOT &&
      !full.startsWith(DESKTOP_ROOT + path.sep)
    ) {
      throw new Error("Path is outside the allowed folder");
    }

    return full;
  }

  // Normal ROOT path
  const full = path.resolve(ROOT, normalized);

  if (
    full !== ROOT &&
    !full.startsWith(ROOT + path.sep)
  ) {
    throw new Error("Path is outside the allowed folder");
  }

  return full;
};

const send = (res, code, data) => {
  res.writeHead(code, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let s = "";

    req.on("data", (chunk) => {
      s += chunk;
    });

    req.on("end", () => {
      try {
        resolve(s ? JSON.parse(s) : {});
      } catch (error) {
        reject(error);
      }
    });
  });

const routes = {
  // --------------------------------------------------
  // SYSTEM
  // --------------------------------------------------

  "GET /api/system": async () => ({
    hostname: os.hostname(),
    user: os.userInfo().username,
    hostOS: `${os.type()} ${os.release()}`,
    platform: os.platform(),
    cpu: (os.cpus()[0]?.model || "Unknown CPU").trim(),
    cores: os.cpus().length,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    uptime: os.uptime(),
    root: ROOT,
    desktop: DESKTOP_ROOT,
  }),

  // --------------------------------------------------
  // DRIVES
  // --------------------------------------------------

  "GET /api/drives": async () => {
    const mounts =
      os.platform() === "win32"
        ? "CDEFGHIJKLMNOPQRSTUVWXYZ"
            .split("")
            .map((letter) => `${letter}:\\`)
        : ["/"];

    const out = [];

    for (const mount of mounts) {
      try {
        const stat = await fs.statfs(mount);

        const total = stat.blocks * stat.bsize;
        const free = stat.bavail * stat.bsize;

        if (total > 0) {
          out.push({
            mount,
            label: mount.replace("\\", ""),
            total,
            used: total - free,
          });
        }
      } catch {
        // Drive does not exist or is inaccessible.
      }
    }

    return out;
  },

  // --------------------------------------------------
  // QUICK ACCESS
  // --------------------------------------------------

  "GET /api/fs/quick": async () => {
    const names = [
      "Desktop",
      "Documents",
      "Downloads",
      "Pictures",
      "Music",
      "Videos",
    ];

    const found = [];

    for (const name of names) {
      try {
        let folder;

        if (name === "Desktop") {
          folder = DESKTOP_ROOT;
        } else {
          folder = path.join(ROOT, name);
        }

        if ((await fs.stat(folder)).isDirectory()) {
          found.push(name);
        }
      } catch {}
    }

    return found;
  },

  // --------------------------------------------------
  // LIST DIRECTORY
  // --------------------------------------------------

  "GET /api/fs/list": async (_req, query) => {
    const virtualPath = query.get("path") || "";

    const dir = safe(virtualPath);

    const entries = await fs.readdir(dir, {
      withFileTypes: true,
    });

    const items = await Promise.all(
      entries.map(async (entry) => {
        try {
          const fullPath = path.join(
            dir,
            entry.name
          );

          const stat = await fs.stat(fullPath);

          return {
            name: entry.name,
            isDir: stat.isDirectory(),
            size: stat.size,
            modified: stat.mtimeMs,
          };
        } catch {
          return null;
        }
      })
    );

    return items
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(b.isDir) - Number(a.isDir) ||
          a.name.localeCompare(b.name)
      );
  },

  // --------------------------------------------------
  // READ FILE
  // --------------------------------------------------

  "GET /api/fs/read": async (_req, query) => {
    const file = safe(query.get("path") || "");

    const stat = await fs.stat(file);

    if (stat.isDirectory()) {
      throw new Error("That is a folder");
    }

    if (stat.size > MAX_READ) {
      throw new Error(
        "File is too large to preview (max 1 MB)"
      );
    }

    return {
      content: await fs.readFile(file, "utf8"),
      size: stat.size,
    };
  },

  // --------------------------------------------------
  // CREATE FOLDER
  // --------------------------------------------------

  "POST /api/fs/mkdir": async (_req, _query, body) => {
    await fs.mkdir(
      safe(body.path),
      {
        recursive: true,
      }
    );

    return {
      ok: true,
    };
  },

  // --------------------------------------------------
  // RENAME
  // --------------------------------------------------

  "POST /api/fs/rename": async (_req, _query, body) => {
    await fs.rename(
      safe(body.from),
      safe(body.to)
    );

    return {
      ok: true,
    };
  },

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  "POST /api/fs/delete": async (_req, _query, body) => {
    const target = safe(body.path);

    if (
      target === ROOT ||
      target === DESKTOP_ROOT
    ) {
      throw new Error(
        "Cannot delete the root folder"
      );
    }

    await fs.rm(target, {
      recursive: true,
      force: true,
    });

    return {
      ok: true,
    };
  },
};

// --------------------------------------------------
// HTTP SERVER
// --------------------------------------------------

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(
        req.url,
        `http://${req.headers.host}`
      );

      const handler =
        routes[
          `${req.method} ${url.pathname}`
        ];

      if (!handler) {
        return send(res, 404, {
          error: "Not found",
        });
      }

      const body =
        req.method === "POST"
          ? await readBody(req)
          : {};

      const result = await handler(
        req,
        url.searchParams,
        body
      );

      send(res, 200, result);
    } catch (error) {
      send(res, 400, {
        error:
          error?.message ||
          "Unknown server error",
      });
    }
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(
      `VOS backend running at http://127.0.0.1:${PORT}`
    );

    console.log(
      `Root folder: ${ROOT}`
    );

    console.log(
      `Desktop folder: ${DESKTOP_ROOT}`
    );
  });