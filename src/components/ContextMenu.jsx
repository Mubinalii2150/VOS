import { useEffect, useRef, useState } from "react";
import {
  FolderPlus,
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

  const [showNewFolder, setShowNewFolder] =
    useState(false);

  const [folderName, setFolderName] =
    useState("New Folder");

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const outside = (event) => {
      if (
        !menuRef.current?.contains(
          event.target
        )
      ) {
        close?.();
      }
    };

    const escape = (event) => {
      if (event.key === "Escape") {
        close?.();
      }
    };

    document.addEventListener(
      "mousedown",
      outside
    );

    window.addEventListener(
      "keydown",
      escape
    );

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

  // --------------------------------------------------
  // CREATE NEW FOLDER
  // --------------------------------------------------

  const createFolder = async () => {
    const name = folderName.trim();

    if (!name) {
      setError("Enter a folder name.");
      return;
    }

    // Windows-invalid characters:
    // < > : " / \ | ? *
    if (/[<>:"/\\|?*]/.test(name)) {
      setError(
        'Invalid folder name. Avoid: < > : " / \\ | ? *'
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      // Creates folder inside the real Windows Desktop
      await fsApi.mkdir(
        `Desktop/${name}`
      );

      // Tell App.jsx to reload desktop folders
      window.dispatchEvent(
        new CustomEvent(
          "vos:filesystem-refresh"
        )
      );

      setShowNewFolder(false);

      close?.();
    } catch (err) {
      console.error(
        "New Folder failed:",
        err
      );

      setError(
        err?.message ||
          "Could not create folder."
      );
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const refresh = () => {
    window.dispatchEvent(
      new CustomEvent(
        "vos:filesystem-refresh"
      )
    );

    onRefresh?.();

    close?.();
  };

  // --------------------------------------------------
  // NEW FOLDER DIALOG
  // --------------------------------------------------

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
            setFolderName(
              event.target.value
            );
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

  // --------------------------------------------------
  // MAIN CONTEXT MENU
  // --------------------------------------------------

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
      <button
        type="button"
        className="context-item"
        onClick={() => {
          setFolderName("New Folder");
          setError("");
          setShowNewFolder(true);
        }}
      >
        <FolderPlus size={17} />
        <span>New Folder</span>
      </button>

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

      <button
        type="button"
        className="context-item"
        onClick={refresh}
      >
        <RefreshCw size={17} />
        <span>Refresh</span>
      </button>

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