import {
  Search,
  Folder,
  Settings,
  Terminal,
  Globe,
  Clock3,
  Monitor,
  Archive,
  File,
  Loader2,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { fsApi } from "../lib/fsApi";

export default function SearchPanel({
  open,
  search,
  setSearch,
  openExplorer,
  openSettings,
  openTerminal,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------
  // RECENT ITEMS
  // -----------------------------------------

  const recent = [
    {
      name: "Files",
      icon: Folder,
      action: openExplorer,
    },
    {
      name: "Terminal",
      icon: Terminal,
      action: openTerminal,
    },
    {
      name: "Settings",
      icon: Settings,
      action: openSettings,
    },
    {
      name: "Downloads",
      icon: Folder,
      action: () => {
        openExplorer();

        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("vos:open-folder", {
              detail: {
                path: "Downloads",
              },
            })
          );
        }, 0);
      },
    },
    {
      name: "Computer",
      icon: Monitor,
      action: () => {
        window.dispatchEvent(
          new CustomEvent("vos:open-computer")
        );
      },
    },
  ];

  // -----------------------------------------
  // QUICK SEARCHES
  // -----------------------------------------

  const quick = [
    "Weather today",
    "Top news",
    "Gold rate today",
    "Trending",
    "Open Web results",
  ];

  // -----------------------------------------
  // SEARCH TYPE
  // -----------------------------------------

  const searchType = useMemo(() => {
    switch (activeTab) {
      case "Apps":
        return "apps";

      case "Files":
        return "files";

      case "Settings":
        return "settings";

      default:
        return "all";
    }
  }, [activeTab]);

  // -----------------------------------------
  // BACKEND SEARCH
  // -----------------------------------------

  useEffect(() => {
    if (!open) return;

    const query = search.trim();

    if (!query) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    // Web tab does not need backend filesystem search
    if (activeTab === "Web") {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fsApi.search(
          query,
          searchType
        );

        if (!cancelled) {
          setResults(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "VOS search failed:",
            err
          );

          setResults([]);
          setError(
            err?.message ||
              "Search backend unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    open,
    search,
    searchType,
    activeTab,
  ]);

  // -----------------------------------------
  // WEB SEARCH
  // -----------------------------------------

  const openWebSearch = (query) => {
    const value = String(query || "").trim();

    if (!value) return;

    const url =
      `https://www.google.com/search?q=` +
      encodeURIComponent(value);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // -----------------------------------------
  // ENTER KEY
  // -----------------------------------------

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;

    const value = search.trim();

    if (!value) return;

    openWebSearch(value);
  };

  // -----------------------------------------
  // TAB CHANGE
  // -----------------------------------------

  const changeTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setResults([]);
  };

  // -----------------------------------------
  // RESULT ICON
  // -----------------------------------------

  const getResultIcon = (item) => {
    if (item.type === "app") {
      switch (item.id) {
        case "terminal":
          return Terminal;

        case "settings":
          return Settings;

        case "computer":
          return Monitor;

        case "extractor":
          return Archive;

        default:
          return Folder;
      }
    }

    if (item.type === "setting") {
      return Settings;
    }

    if (item.type === "folder") {
      return Folder;
    }

    return File;
  };

  // -----------------------------------------
  // OPEN RESULT
  // -----------------------------------------

  const openResult = (item) => {
    // -----------------------------
    // APP
    // -----------------------------

    if (item.type === "app") {
      switch (item.id) {
        case "explorer":
          openExplorer();
          break;

        case "settings":
          openSettings();
          break;

        case "terminal":
          openTerminal();
          break;

        case "computer":
          window.dispatchEvent(
            new CustomEvent(
              "vos:open-computer"
            )
          );
          break;

        case "extractor":
          window.dispatchEvent(
            new CustomEvent(
              "vos:open-extractor"
            )
          );
          break;

        default:
          break;
      }

      return;
    }

    // -----------------------------
    // SETTINGS
    // -----------------------------

    if (item.type === "setting") {
      openSettings();

      window.dispatchEvent(
        new CustomEvent(
          "vos:open-setting",
          {
            detail: {
              id: item.id,
            },
          }
        )
      );

      return;
    }

    // -----------------------------
    // FILE / FOLDER
    // -----------------------------

    if (
      item.type === "file" ||
      item.type === "folder"
    ) {
      if (!item.path) return;

      openExplorer();

      // Folder -> open directly
      if (item.type === "folder") {
        window.dispatchEvent(
          new CustomEvent(
            "vos:open-folder",
            {
              detail: {
                path: item.path,
              },
            }
          )
        );

        return;
      }

      // File -> open its parent folder
      const parts = item.path.split("/");

      parts.pop();

      const parentPath =
        parts.join("/");

      window.dispatchEvent(
        new CustomEvent(
          "vos:open-folder",
          {
            detail: {
              path: parentPath,
            },
          }
        )
      );
    }
  };

  // -----------------------------------------
  // RECENT FILTER
  // -----------------------------------------

  const filteredRecent = recent.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  // -----------------------------------------
  // RENDER
  // -----------------------------------------

  if (!open) return null;

  return (
    <div className="search-overlay">
      <div className="search-panel">

        {/* -------------------------------- */}
        {/* SEARCH INPUT */}
        {/* -------------------------------- */}

        <div className="panel-head">
          <Search size={18} />

          <input
            autoFocus
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Search apps, files, settings, web"
          />
        </div>

        {/* -------------------------------- */}
        {/* TABS */}
        {/* -------------------------------- */}

        <div className="panel-tabs">

          {[
            "All",
            "Apps",
            "Files",
            "Settings",
            "Web",
          ].map((tab) => (
            <span
              key={tab}
              className={
                activeTab === tab
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeTab(tab)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === " "
                ) {
                  changeTab(tab);
                }
              }}
            >
              {tab}
            </span>
          ))}

        </div>

        {/* -------------------------------- */}
        {/* SEARCH RESULTS */}
        {/* -------------------------------- */}

        {search.trim() ? (
          <div className="panel-grid">

            <div>
              <h4>
                {activeTab === "Web"
                  ? "Web Search"
                  : "Results"}
              </h4>

              {/* Loading */}

              {loading && (
                <div className="panel-item">
                  <Loader2
                    size={18}
                    className="vos-search-spinner"
                  />

                  Searching...
                </div>
              )}

              {/* Error */}

              {!loading && error && (
                <div className="panel-item">
                  <File size={18} />
                  {error}
                </div>
              )}

              {/* Results */}

              {!loading &&
                !error &&
                results.map((item, index) => {
                  const Icon =
                    getResultIcon(item);

                  return (
                    <button
                      key={
                        item.path ||
                        item.id ||
                        `${item.name}-${index}`
                      }
                      className="panel-item"
                      onClick={() =>
                        openResult(item)
                      }
                      type="button"
                    >
                      <Icon size={18} />

                      <span>
                        {item.name}
                      </span>
                    </button>
                  );
                })}

              {/* No Results */}

              {!loading &&
                !error &&
                results.length === 0 &&
                activeTab !== "Web" && (
                  <div className="panel-item">
                    <Search size={18} />

                    No results found
                  </div>
                )}

              {/* Web */}

              {activeTab === "Web" && (
                <button
                  type="button"
                  className="panel-item"
                  onClick={() =>
                    openWebSearch(search)
                  }
                >
                  <Globe size={18} />

                  Search the web for "
                  {search}"
                </button>
              )}

            </div>

            {/* Quick searches */}

            <div>
              <h4>Quick searches</h4>

              {quick
                .filter((q) =>
                  q
                    .toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )
                )
                .map((q) => (
                  <button
                    type="button"
                    className="quick-item"
                    key={q}
                    onClick={() =>
                      openWebSearch(q)
                    }
                  >
                    <Globe size={16} />
                    {q}
                  </button>
                ))}

            </div>

          </div>
        ) : (
          /* -------------------------------- */
          /* DEFAULT / RECENT VIEW */
          /* -------------------------------- */

          <div className="panel-grid">

            <div>
              <h4>Recent</h4>

              {filteredRecent.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.name}
                      className="panel-item"
                      onClick={item.action}
                      type="button"
                    >
                      <Icon size={18} />

                      {item.name}
                    </button>
                  );
                }
              )}
            </div>

            <div>
              <h4>Quick searches</h4>

              {quick.map((q) => (
                <button
                  type="button"
                  className="quick-item"
                  key={q}
                  onClick={() =>
                    openWebSearch(q)
                  }
                >
                  <Globe size={16} />
                  {q}
                </button>
              ))}
            </div>

          </div>
        )}

        {/* -------------------------------- */}
        {/* FOOTER */}
        {/* -------------------------------- */}

        <div className="panel-footer">
          <Clock3 size={15} />

          Press Enter to search the web
        </div>

      </div>
    </div>
  );
}