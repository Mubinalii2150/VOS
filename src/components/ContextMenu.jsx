import { useEffect, useRef, useState } from "react";
import {
  FolderPlus,
  FilePlus,
  Clipboard,
  RefreshCw,
  Palette,
  MonitorCog,
} from "lucide-react";
import { fsApi } from "../lib/fsApi";

export default function ContextMenu({
  x = 0,
  y = 0,
  close,
  onPersonalize,
  onDisplaySettings,
  onRefresh,
}) {
  const menuRef = useRef(null);

  // -----------------------------
  // STATES
  // -----------------------------
  const [showNewMenu, setShowNewMenu] = useState(false);

  const [showNewFolder, setShowNewFolder] =
    useState(false);

  const [showNewFile, setShowNewFile] =
    useState(false);

  const [folderName, setFolderName] =
    useState("New Folder");

  const [fileName, setFileName] =
    useState("New File.txt");

  const [creating, setCreating] =
    useState(false);

  const [error, setError] = useState("");

  // -----------------------------
  // OUTSIDE CLICK / ESCAPE
  // -----------------------------
  useEffect(() => {
    const outside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        close?.();
      }
    };

    const escape = (event) => {
      if (event.key === "Escape") {
        close?.();
      }
    };

    document.addEventListener("mousedown", outside);
    window.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener(
        "mousedown",
        outside
      );

      window.removeEventListener(
        "keydown",
        escape
      );
    };
  }, [close]);

  // -----------------------------
  // CREATE FOLDER
  // -----------------------------
  const createFolder = async () => {
    const name = folderName.trim();

    if (!name) {
      setError("Enter a folder name.");
      return;
    }

    if (/[<>:"/\\|?*]/.test(name)) {
      setError(
        'Invalid folder name. Avoid: < > : " / \\ | ? *'
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      await fsApi.mkdir(`Desktop/${name}`);

      window.dispatchEvent(
        new CustomEvent("vos:filesystem-refresh")
      );

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("vos:filesystem-refresh")
        );
      }, 250);

      setShowNewFolder(false);
      close?.();
    } catch (err) {
      console.error("New Folder failed:", err);

      setError(
        err?.message ||
          "Could not create folder."
      );
    } finally {
      setCreating(false);
    }
  };

  // -----------------------------
  // CREATE FILE
  // -----------------------------
  const createFile = async () => {
    const name = fileName.trim();

    if (!name) {
      setError("Enter a file name.");
      return;
    }

    if (/[<>:"/\\|?*]/.test(name)) {
      setError(
        'Invalid file name. Avoid: < > : " / \\ | ? *'
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      await fsApi.createFile(
        `Desktop/${name}`
      );

      window.dispatchEvent(
        new CustomEvent("vos:filesystem-refresh")
      );

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("vos:filesystem-refresh")
        );
      }, 250);

      setShowNewFile(false);
      close?.();
    } catch (err) {
      console.error("New File failed:", err);

      setError(
        err?.message ||
          "Could not create file."
      );
    } finally {
      setCreating(false);
    }
  };

  // -----------------------------
  // REFRESH
  // -----------------------------
  const refresh = () => {
    window.dispatchEvent(
      new CustomEvent("vos:filesystem-refresh")
    );

    onRefresh?.();

    window.dispatchEvent(
      new CustomEvent("vos:show-refresh-status")
    );

    close?.();
  };

  // ==================================================
  // NEW FOLDER DIALOG
  // ==================================================
  if (showNewFolder) {
    return (
      <div
        ref={menuRef}
        className="context-menu new-folder-dialog"
        style={{
          left: Math.max(8, x),
          top: Math.max(8, y),
        }}
        onContextMenu={(event) =>
          event.preventDefault()
        }
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="context-dialog-title">
          New Folder
        </div>

        <input
          autoFocus
          value={folderName}
          onChange={(event) => {
            setFolderName(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              createFolder();
            }

            if (event.key === "Escape") {
              setShowNewFolder(false);
              setError("");
            }
          }}
          className="context-folder-input"
          placeholder="Folder name"
        />

        {error && (
          <div className="context-error">
            {error}
          </div>
        )}

        <div className="context-dialog-actions">
          <button
            type="button"
            onClick={() => {
              setShowNewFolder(false);
              setError("");
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={creating}
            onClick={createFolder}
          >
            {creating
              ? "Creating..."
              : "Create"}
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // NEW FILE DIALOG
  // ==================================================
  if (showNewFile) {
    return (
      <div
        ref={menuRef}
        className="context-menu new-folder-dialog"
        style={{
          left: Math.max(8, x),
          top: Math.max(8, y),
        }}
        onContextMenu={(event) =>
          event.preventDefault()
        }
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="context-dialog-title">
          New File
        </div>

        <input
          autoFocus
          value={fileName}
          onChange={(event) => {
            setFileName(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              createFile();
            }

            if (event.key === "Escape") {
              setShowNewFile(false);
              setError("");
            }
          }}
          className="context-folder-input"
          placeholder="File name"
        />

        {error && (
          <div className="context-error">
            {error}
          </div>
        )}

        <div className="context-dialog-actions">
          <button
            type="button"
            onClick={() => {
              setShowNewFile(false);
              setError("");
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={creating}
            onClick={createFile}
          >
            {creating
              ? "Creating..."
              : "Create"}
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN DESKTOP CONTEXT MENU
  // ==================================================
  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: Math.max(8, x),
        top: Math.max(8, y),
      }}
      onContextMenu={(event) =>
        event.preventDefault()
      }
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      {/* NEW */}
      <button
        type="button"
        className="context-item"
        onClick={() => {
          setShowNewMenu(
            (value) => !value
          );
          setError("");
        }}
      >
        <FolderPlus size={17} />
        <span>New</span>
        <span className="context-arrow">
          ›
        </span>
      </button>

      {/* NEW SUBMENU */}
      {showNewMenu && (
        <div className="new-menu-submenu">
          <button
            type="button"
            className="context-item"
            onClick={() => {
              setFolderName("New Folder");
              setShowNewMenu(false);
              setShowNewFolder(true);
              setError("");
            }}
          >
            <FolderPlus size={17} />
            <span>Folder</span>
          </button>

          <button
            type="button"
            className="context-item"
            onClick={() => {
              setFileName("New File.txt");
              setShowNewMenu(false);
              setShowNewFile(true);
              setError("");
            }}
          >
            <FilePlus size={17} />
            <span>File</span>
          </button>
        </div>
      )}

      {/* PASTE */}
      <button
        type="button"
        className="context-item"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("vos:paste")
          );

          close?.();
        }}
      >
        <Clipboard size={17} />
        <span>Paste</span>
      </button>

      {/* REFRESH */}
      <button
        type="button"
        className="context-item"
        onClick={refresh}
      >
        <RefreshCw size={17} />
        <span>Refresh</span>
      </button>

      {/* PERSONALIZE */}
      <button
        type="button"
        className="context-item"
        onClick={() => {
          onPersonalize?.();
          close?.();
        }}
      >
        <Palette size={17} />
        <span>Personalize</span>
      </button>

      {/* DISPLAY SETTINGS */}
      <button
        type="button"
        className="context-item"
        onClick={() => {
          onDisplaySettings?.();
          close?.();
        }}
      >
        <MonitorCog size={17} />
        <span>Display Settings</span>
      </button>
    </div>
  );
}