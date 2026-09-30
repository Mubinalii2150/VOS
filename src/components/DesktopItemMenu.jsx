import {
  FolderOpen,
  Pencil,
  Copy,
  Link,
  Terminal,
  Trash2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { fsApi } from "../lib/fsApi";

export default function DesktopItemMenu({
  x = 0,
  y = 0,
  item,
  close,
  onRefresh,
  openExplorer,
  openTerminal,
}) {
  const menuRef = useRef(null);

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

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [close]);

  if (!item) return null;

  const virtualPath = `Desktop/${item.name}`;

  // --------------------------------------------------
  // OPEN
  // --------------------------------------------------

  const openItem = () => {
    openExplorer?.();

    window.dispatchEvent(
      new CustomEvent("vos:open-folder", {
        detail: {
          path: virtualPath,
        },
      })
    );

    close?.();
  };

  // --------------------------------------------------
  // RENAME
  // --------------------------------------------------

  const renameItem = async () => {
    const newName = window.prompt(
      "Rename folder",
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
        'Invalid folder name. Avoid: < > : " / \\ | ? *'
      );
      return;
    }

    try {
      await fsApi.rename(
        virtualPath,
        `Desktop/${name}`
      );

      window.dispatchEvent(
        new CustomEvent("vos:filesystem-refresh")
      );

      onRefresh?.();
    } catch (error) {
      console.error("Rename failed:", error);

      window.alert(
        error?.message ||
          "Could not rename folder."
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // COPY
  // --------------------------------------------------

  const copyItem = async () => {
    try {
      await navigator.clipboard.writeText(item.name);
    } catch (error) {
      console.error("Copy failed:", error);

      window.alert(
        "Could not copy folder name."
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // COPY PATH
  // --------------------------------------------------

  const copyPath = async () => {
    try {
      const system = await fsApi.system();

      const desktop = system.desktop || "";

      const separator = desktop.includes("\\")
        ? "\\"
        : "/";

      const fullPath =
        `${desktop}${separator}${item.name}`;

      await navigator.clipboard.writeText(fullPath);
    } catch (error) {
      console.error(
        "Copy path failed:",
        error
      );

      window.alert(
        "Could not copy folder path."
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // OPEN WITH TERMINAL
  // --------------------------------------------------

  const openTerminalHere = () => {
    openTerminal?.();

    window.dispatchEvent(
      new CustomEvent("vos:terminal-path", {
        detail: {
          path: virtualPath,
        },
      })
    );

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
      console.error(
        "Delete failed:",
        error
      );

      window.alert(
        error?.message ||
          "Could not delete folder."
      );
    }

    close?.();
  };

  // --------------------------------------------------
  // MENU POSITION
  // --------------------------------------------------

  const menuWidth = 230;
  const menuHeight = 300;

  const safeX = Math.max(
    8,
    Math.min(
      Number(x) || 0,
      window.innerWidth - menuWidth - 8
    )
  );

  const safeY = Math.max(
    66,
    Math.min(
      Number(y) || 66,
      window.innerHeight - menuHeight - 70
    )
  );

  return (
    <div
      ref={menuRef}
      className="desktop-item-menu"
      style={{
        left: safeX,
        top: safeY,
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
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