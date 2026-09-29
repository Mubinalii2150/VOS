// VOS local backend — zero dependencies (pure Node.js, needs Node 18.15+)
// Run:  node server/vos-server.mjs
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { URL } from 'node:url';

const PORT = 4000;
const ROOT = path.resolve(process.env.VOS_ROOT || os.homedir()); // VOS can only touch files inside ROOT
const MAX_READ = 1024 * 1024; // 1 MB text preview limit

// Blocks "../../" tricks: every path must stay inside ROOT
const safe = (rel = '') => {
  const full = path.resolve(ROOT, rel);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) throw new Error('Path is outside the allowed folder');
  return full;
};

const send = (res, code, data) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};
const readBody = (req) =>
  new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
  });

const routes = {
  'GET /api/system': async () => ({
    hostname: os.hostname(),
    user: os.userInfo().username,
    hostOS: `${os.type()} ${os.release()}`,
    platform: os.platform(),
    cpu: (os.cpus()[0]?.model || 'Unknown CPU').trim(),
    cores: os.cpus().length,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    uptime: os.uptime(),
    root: ROOT,
  }),

  'GET /api/drives': async () => {
    const mounts = os.platform() === 'win32'
      ? 'CDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => `${l}:\\`)
      : ['/'];
    const out = [];
    for (const mount of mounts) {
      try {
        const s = await fs.statfs(mount);
        const total = s.blocks * s.bsize;
        const free = s.bavail * s.bsize;
        if (total > 0) out.push({ mount, label: mount.replace('\\', ''), total, used: total - free });
      } catch { /* no such drive */ }
    }
    return out;
  },

  // Which quick-access folders actually exist under ROOT
  'GET /api/fs/quick': async () => {
    const names = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos'];
    const found = [];
    for (const n of names) {
      try { if ((await fs.stat(path.join(ROOT, n))).isDirectory()) found.push(n); } catch {}
    }
    return found;
  },

  'GET /api/fs/list': async (_req, q) => {
    const dir = safe(q.get('path') || '');
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const items = await Promise.all(entries.map(async (e) => {
      try {
        const s = await fs.stat(path.join(dir, e.name));
        return { name: e.name, isDir: s.isDirectory(), size: s.size, modified: s.mtimeMs };
      } catch { return null; } // locked / permission-denied entries are skipped
    }));
    return items
      .filter(Boolean)
      .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name));
  },

  'GET /api/fs/read': async (_req, q) => {
    const file = safe(q.get('path'));
    const s = await fs.stat(file);
    if (s.isDirectory()) throw new Error('That is a folder');
    if (s.size > MAX_READ) throw new Error('File is too large to preview (max 1 MB)');
    return { content: await fs.readFile(file, 'utf8'), size: s.size };
  },

  'POST /api/fs/mkdir': async (_r, _q, b) => { await fs.mkdir(safe(b.path), { recursive: true }); return { ok: true }; },
  'POST /api/fs/rename': async (_r, _q, b) => { await fs.rename(safe(b.from), safe(b.to)); return { ok: true }; },
  'POST /api/fs/delete': async (_r, _q, b) => {
    if (safe(b.path) === ROOT) throw new Error('Cannot delete the root folder');
    await fs.rm(safe(b.path), { recursive: true });
    return { ok: true };
  },
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const handler = routes[`${req.method} ${url.pathname}`];
  if (!handler) return send(res, 404, { error: 'Not found' });
  try {
    const body = req.method === 'POST' ? await readBody(req) : {};
    send(res, 200, await handler(req, url.searchParams, body));
  } catch (e) {
    send(res, 400, { error: e.message });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`VOS backend running at http://127.0.0.1:${PORT}`);
  console.log(`Root folder: ${ROOT}`);
});
