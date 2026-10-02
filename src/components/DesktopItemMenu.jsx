import {
  FolderOpen,
  Pencil,
  Copy,
  Scissors,
  Link,
  Terminal,
  Trash2,
  Shield,
  FolderSearch,
  Play,
  Archive,
  ChevronRight,
  FileArchive,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { fsApi } from "../lib/fsApi";

export default function DesktopItemMenu({
  x = 0,
  y = 0,
  item,
  kind = "folder",

  close,
  onRefresh,

  openExplorer,
  openTerminal,

  onOpen,
  onRunAsAdmin,
  onOpenLocation,
}) {
  const menuRef = useRef(null);
  const [showCompress, setShowCompress] = useState(false);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        close?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        close?.();
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [close]);

  if (!item) return null;

  const isApp = kind === "app";
  const isFile = kind === "file";
  const isFolder = kind === "folder";

  const virtualPath =
    item.path ||
    `Desktop/${item.name}`;

  // --------------------------------------------------
  // OPEN
  // --------------------------------------------------

  const openItem = () => {
    if (onOpen) {
      onOpen(item);
    } else {
      openExplorer?.();

      window.dispatchEvent(
        new CustomEvent("vos:open-folder", {
          detail: {
            path: virtualPath,
          },
        })
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // RENAME
  // --------------------------------------------------

  const renameItem = async () => {
    const newName = window.prompt(
      "Rename",
      item.name
    );

    if (newName === null) return;

    const name = newName.trim();

    if (!name || name === item.name) {
      close?.();
      return;
    }

    if (/[<>:"/\\|?*]/.test(name)) {
      window.alert(
        'Invalid name. Avoid: < > : " / \\ | ? *'
      );
      return;
    }

    try {
      const parentPath =
        virtualPath.substring(
          0,
          virtualPath.lastIndexOf("/")
        );

      const newPath =
        `${parentPath}/${name}`;

      await fsApi.rename(
        virtualPath,
        newPath
      );

      window.dispatchEvent(
        new CustomEvent(
          "vos:filesystem-refresh"
        )
      );

      onRefresh?.();
    } catch (error) {
      console.error(
        "Rename failed:",
        error
      );

      window.alert(
        error?.message ||
          "Could not rename."
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // COPY
  // --------------------------------------------------

  const copyItem = async () => {
    try {
      await navigator.clipboard.writeText(
        virtualPath
      );

      window.dispatchEvent(
        new CustomEvent("vos:clipboard-copy", {
          detail: {
            item,
            path: virtualPath,
          },
        })
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // CUT
  // --------------------------------------------------

  const cutItem = () => {
    window.dispatchEvent(
      new CustomEvent("vos:clipboard-cut", {
        detail: {
          item,
          path: virtualPath,
        },
      })
    );

    close?.();
  };

  // --------------------------------------------------
  // COPY PATH
  // --------------------------------------------------

  const copyPath = async () => {
    try {
      const system =
        await fsApi.system();

      const desktop =
        system.desktop || "";

      const separator =
        desktop.includes("\\")
          ? "\\"
          : "/";

      const fullPath =
        `${desktop}${separator}${item.name}`;

      await navigator.clipboard.writeText(
        fullPath
      );
    } catch (error) {
      console.error(
        "Copy path failed:",
        error
      );

      window.alert(
        "Could not copy path."
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // TERMINAL
  // --------------------------------------------------

  const openTerminalHere = () => {
    openTerminal?.();

    window.dispatchEvent(
      new CustomEvent(
        "vos:terminal-path",
        {
          detail: {
            path: virtualPath,
          },
        }
      )
    );

    close?.();
  };

  // --------------------------------------------------
  // COMPRESS
  // --------------------------------------------------

  const compress = async (format) => {
    try {
      await fsApi.compress(
        virtualPath,
        format
      );

      window.dispatchEvent(
        new CustomEvent(
          "vos:filesystem-refresh"
        )
      );

      onRefresh?.();

      window.alert(
        `Created ${format.toUpperCase()} archive.`
      );
    } catch (error) {
      console.error(
        "Compression failed:",
        error
      );

      window.alert(
        error?.message ||
          `Could not create ${format.toUpperCase()} archive.`
      );
    }

    setShowCompress(false);
    close?.();
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const deleteItem = async () => {
  const confirmed = window.confirm(
    `Delete "${item.name}"?`
  );

  if (!confirmed) return;

  try {
    await fsApi.remove(virtualPath);

    window.dispatchEvent(
      new CustomEvent("vos:filesystem-refresh")
    );

    onRefresh?.();
  } catch (error) {
    console.error("Delete failed:", error);

    window.alert(
      error?.message ||
        "Could not delete item."
    );

    return;
  }

  close?.();
};
 
  // --------------------------------------------------
  // APP ACTIONS
  // --------------------------------------------------

  const runAsAdministrator = () => {
    onRunAsAdmin?.(item);
    close?.();
  };

  const openFileLocation = () => {
    onOpenLocation?.(item);
    close?.();
  };

  // --------------------------------------------------
  // POSITION
  // --------------------------------------------------

  const menuWidth = 245;
  const menuHeight = isApp
    ? 300
    : 390;

  const safeX = Math.max(
    8,
    Math.min(
      Number(x) || 0,
      window.innerWidth -
        menuWidth -
        8
    )
  );

  const safeY = Math.max(
    66,
    Math.min(
      Number(y) || 66,
      window.innerHeight -
        menuHeight -
        70
    )
  );

  // --------------------------------------------------
  // APP MENU
  // --------------------------------------------------

  if (isApp) {
    return (
      <div
        ref={menuRef}
        className="desktop-item-menu"
        style={{
          left: safeX,
          top: safeY,
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={openItem}
        >
          <Play size={16} />
          <span>Open</span>
        </button>

        <button
          type="button"
          onClick={cutItem}
        >
          <Scissors size={16} />
          <span>Cut</span>
        </button>

        <button
          type="button"
          onClick={copyItem}
        >
          <Copy size={16} />
          <span>Copy</span>
        </button>

        <div className="desktop-item-separator" />

        <button
          type="button"
          onClick={runAsAdministrator}
        >
          <Shield size={16} />
          <span>
            Run as Administrator
          </span>
        </button>

        <button
          type="button"
          onClick={openFileLocation}
        >
          <FolderSearch size={16} />
          <span>
            Open file location
          </span>
        </button>

        <button
          type="button"
          onClick={renameItem}
        >
          <Pencil size={16} />
          <span>Rename</span>
        </button>

        <button
          type="button"
          className="danger"
          onClick={deleteItem}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // FILE / FOLDER MENU
  // --------------------------------------------------

  return (
    <div
      ref={menuRef}
      className="desktop-item-menu"
      style={{
        left: safeX,
        top: safeY,
      }}
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <button
        type="button"
        onClick={openItem}
      >
        <FolderOpen size={16} />
        <span>Open</span>
      </button>

      <button
        type="button"
        onClick={renameItem}
      >
        <Pencil size={16} />
        <span>Rename</span>
      </button>

      <div className="desktop-item-separator" />

      <button
        type="button"
        onClick={copyItem}
      >
        <Copy size={16} />
        <span>Copy</span>
      </button>

      <button
        type="button"
        onClick={cutItem}
      >
        <Scissors size={16} />
        <span>Cut</span>
      </button>

      <button
        type="button"
        onClick={copyPath}
      >
        <Link size={16} />
        <span>Copy Path</span>
      </button>

      <div className="desktop-item-separator" />

      <button
        type="button"
        onClick={openTerminalHere}
      >
        <Terminal size={16} />
        <span>Open with Terminal</span>
      </button>

      {/* COMPRESS */}
      <div className="desktop-menu-submenu">
        <button
          type="button"
          onClick={() =>
            setShowCompress(
              !showCompress
            )
          }
        >
          <Archive size={16} />

          <span>
            Compress to
          </span>

          <ChevronRight
            size={15}
            className="submenu-arrow"
          />
        </button>

        {showCompress && (
          <div className="desktop-submenu">
            <button
              type="button"
              onClick={() =>
                compress("zip")
              }
            >
              <FileArchive
                size={15}
              />
              <span>
                ZIP file
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                compress("7z")
              }
            >
              <FileArchive
                size={15}
              />
              <span>
                7Z file
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                compress("tar")
              }
            >
              <FileArchive
                size={15}
              />
              <span>
                TAR file
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="desktop-item-separator" />

      <button
        type="button"
        className="danger"
        onClick={deleteItem}
      >
        <Trash2 size={16} />
        <span>Delete</span>
      </button>
    </div>
  );
}