// src/components/FileExplorer.jsx

import { useEffect, useMemo, useState } from "react";

import {
  Home,
  FileText,
  Download,
  Image,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Search,
  Grid2X2,
  List,
  Folder,
  File,
  RefreshCw,
} from "lucide-react";

import {
  fsApi,
  fmtSize,
  gb,
} from "../lib/fsApi";

export default function FileExplorer() {
  /*
    Empty path means:
    C:\Users\mobin

    because the backend ROOT is os.homedir()
  */
  const [currentPath, setCurrentPath] = useState("");

  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [items, setItems] = useState([]);

  const [quickFolders, setQuickFolders] = useState([]);

  const [drives, setDrives] = useState([]);

  const [search, setSearch] = useState("");

  const [grid, setGrid] = useState(true);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
    --------------------------------------------------
    LOAD CURRENT DIRECTORY
    --------------------------------------------------
  */

  const loadCurrentFolder = async (path = currentPath) => {
    try {
      setLoading(true);
      setError("");

      const result = await fsApi.list(path);

      if (Array.isArray(result)) {
        setItems(result);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("File Explorer error:", err);

      setItems([]);

      setError(
        err?.message ||
        "Unable to read this folder"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    --------------------------------------------------
    LOAD QUICK ACCESS
    --------------------------------------------------
  */

  const loadQuickFolders = async () => {
    try {
      const result = await fsApi.quick();

      if (Array.isArray(result)) {
        setQuickFolders(result);
      } else {
        setQuickFolders([]);
      }
    } catch (err) {
      console.error(
        "Quick access error:",
        err
      );

      setQuickFolders([]);
    }
  };

  /*
    --------------------------------------------------
    LOAD STORAGE
    --------------------------------------------------
  */

  const loadDrives = async () => {
    try {
      const result = await fsApi.drives();

      if (Array.isArray(result)) {
        setDrives(result);
      } else {
        setDrives([]);
      }
    } catch (err) {
      console.error(
        "Drive information error:",
        err
      );

      setDrives([]);
    }
  };

  /*
    --------------------------------------------------
    INITIAL LOAD
    --------------------------------------------------
  */

  useEffect(() => {
    loadCurrentFolder("");
    loadQuickFolders();
    loadDrives();
  }, []);

  /*
    --------------------------------------------------
    REAL-TIME REFRESH
    Every 5 seconds
    --------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      loadCurrentFolder(currentPath);
      loadQuickFolders();
      loadDrives();
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [currentPath]);

  /*
    --------------------------------------------------
    NAVIGATION
    --------------------------------------------------
  */

  const navigateTo = (path) => {
    const newHistory = [
      ...history.slice(
        0,
        historyIndex + 1
      ),
      path,
    ];

    setHistory(newHistory);

    setHistoryIndex(
      newHistory.length - 1
    );

    setCurrentPath(path);

    setSearch("");
  };

  /*
    Open actual folder
  */

  const openFolder = (name) => {
    const nextPath = currentPath
      ? `${currentPath}\\${name}`
      : name;

    navigateTo(nextPath);
  };

  /*
    Quick access folder
  */

  const openQuickFolder = (name) => {
    /*
      Since backend ROOT = C:\Users\mobin,
      "Documents" means:

      C:\Users\mobin\Documents
    */

    navigateTo(name);
  };

  /*
    Home
  */

  const goHome = () => {
    navigateTo("");
  };

  /*
    Back
  */

  const goBack = () => {
    if (historyIndex <= 0) {
      return;
    }

    const newIndex =
      historyIndex - 1;

    setHistoryIndex(newIndex);

    setCurrentPath(
      history[newIndex]
    );

    setSearch("");
  };

  /*
    Forward
  */

  const goForward = () => {
    if (
      historyIndex >=
      history.length - 1
    ) {
      return;
    }

    const newIndex =
      historyIndex + 1;

    setHistoryIndex(newIndex);

    setCurrentPath(
      history[newIndex]
    );

    setSearch("");
  };

  /*
    --------------------------------------------------
    SEARCH
    --------------------------------------------------
  */

  const filteredItems = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return items;
    }

    return items.filter((item) =>
      item.name
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  /*
    --------------------------------------------------
    CURRENT FOLDER NAME
    --------------------------------------------------
  */

  const currentFolderName =
    currentPath
      ? currentPath
          .split(/[\\/]/)
          .filter(Boolean)
          .at(-1)
      : "Home";

  /*
    --------------------------------------------------
    STORAGE
    --------------------------------------------------
  */

  const mainDrive =
    drives.find(
      (drive) =>
        String(drive.mount)
          .toUpperCase() === "C:\\"
    ) ||
    drives[0];

  const usedGB = mainDrive
    ? gb(mainDrive.used)
    : "0";

  const totalGB = mainDrive
    ? gb(mainDrive.total)
    : "0";

  const storagePercent =
    mainDrive &&
    mainDrive.total > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (mainDrive.used /
              mainDrive.total) *
              100
          )
        )
      : 0;

  /*
    --------------------------------------------------
    QUICK ACCESS ICON
    --------------------------------------------------
  */

  const getQuickIcon = (name) => {
    if (name === "Documents") {
      return <FileText size={18} />;
    }

    if (name === "Downloads") {
      return <Download size={18} />;
    }

    if (name === "Pictures") {
      return <Image size={18} />;
    }

    return <Briefcase size={18} />;
  };

  /*
    --------------------------------------------------
    UI
    --------------------------------------------------
  */

  return (
    <div className="explorer">

      {/* ================= SIDEBAR ================= */}

      <aside className="explorer-sidebar">

        <p className="side-title">
          QUICK ACCESS
        </p>

        {/* HOME */}

        <button
          className={
            currentPath === ""
              ? "side-btn active"
              : "side-btn"
          }
          onClick={goHome}
        >
          <Home size={18} />

          Home
        </button>

        {/* DOCUMENTS */}

        {quickFolders.includes(
          "Documents"
        ) && (
          <button
            className={
              currentPath ===
              "Documents"
                ? "side-btn active"
                : "side-btn"
            }
            onClick={() =>
              openQuickFolder(
                "Documents"
              )
            }
          >
            <FileText size={18} />

            Documents
          </button>
        )}

        {/* DOWNLOADS */}

        {quickFolders.includes(
          "Downloads"
        ) && (
          <button
            className={
              currentPath ===
              "Downloads"
                ? "side-btn active"
                : "side-btn"
            }
            onClick={() =>
              openQuickFolder(
                "Downloads"
              )
            }
          >
            <Download size={18} />

            Downloads
          </button>
        )}

        {/* PICTURES */}

        {quickFolders.includes(
          "Pictures"
        ) && (
          <button
            className={
              currentPath ===
              "Pictures"
                ? "side-btn active"
                : "side-btn"
            }
            onClick={() =>
              openQuickFolder(
                "Pictures"
              )
            }
          >
            <Image size={18} />

            Pictures
          </button>
        )}

        {/* PROJECTS */}

        <button
          className={
            currentPath ===
            "Projects"
              ? "side-btn active"
              : "side-btn"
          }
          onClick={() =>
            openQuickFolder(
              "Projects"
            )
          }
        >
          <Briefcase size={18} />

          Projects
        </button>

        {/* STORAGE */}

        <div className="storage-box">

          <span>
            Storage
          </span>

          <div className="storage-bar">

            <div
              className="storage-fill"
              style={{
                width:
                  `${storagePercent}%`,
              }}
            />

          </div>

          <small>
            {usedGB} GB / {totalGB} GB
          </small>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <section className="explorer-main">

        {/* TOOLBAR */}

        <div className="toolbar">

          {/* BACK */}

          <button
            className="tool-btn"
            onClick={goBack}
            disabled={
              historyIndex === 0
            }
          >
            <ArrowLeft size={18} />
          </button>

          {/* FORWARD */}

          <button
            className="tool-btn"
            onClick={goForward}
            disabled={
              historyIndex >=
              history.length - 1
            }
          >
            <ArrowRight size={18} />
          </button>

          {/* PATH */}

          <div className="path-bar">

            <Home size={16} />

            <span>
              Home
              {currentPath
                ? ` / ${currentFolderName}`
                : ""}
            </span>

          </div>

          {/* SEARCH */}

          <div className="search-box">

            <Search size={16} />

            <input
              placeholder="Search files..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* REFRESH */}

          <button
            className="tool-btn"
            onClick={() =>
              loadCurrentFolder(
                currentPath
              )
            }
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>

          {/* GRID */}

          <button
            className="tool-btn"
            onClick={() =>
              setGrid(true)
            }
          >
            <Grid2X2 size={18} />
          </button>

          {/* LIST */}

          <button
            className="tool-btn"
            onClick={() =>
              setGrid(false)
            }
          >
            <List size={18} />
          </button>

        </div>

        {/* ================= FILES ================= */}

        <div
          className={
            grid
              ? "file-grid"
              : "file-list"
          }
        >

          {/* LOADING */}

          {loading && (
            <div className="explorer-status">
              Reading filesystem...
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div className="explorer-status">
                {error}
              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredItems.length ===
              0 && (
              <div className="explorer-status">
                {search
                  ? "No matching files."
                  : "This folder is empty."}
              </div>
            )}

          {/* REAL FILES */}

          {!loading &&
            !error &&
            filteredItems.map(
              (item) => (
                <div
                  key={`${item.name}-${item.modified}`}
                  className={
                    grid
                      ? "file-card"
                      : "list-row"
                  }
                  onDoubleClick={() => {
                    if (
                      item.isDir
                    ) {
                      openFolder(
                        item.name
                      );
                    }
                  }}
                >

                  {/* ICON */}

                  {item.isDir ? (
                    <Folder
                      size={48}
                      className="folder-icon"
                    />
                  ) : (
                    <File
                      size={42}
                      className="folder-icon"
                    />
                  )}

                  {/* NAME + SIZE */}

                  <div>

                    <h4>
                      {item.name}
                    </h4>

                    <span>
                      {item.isDir
                        ? "Folder"
                        : fmtSize(
                            item.size
                          )}
                    </span>

                  </div>

                </div>
              )
            )}

        </div>

      </section>

    </div>
  );
}