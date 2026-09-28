import { useEffect, useState } from "react";
import {
  Search,
  Folder,
  Terminal,
  Archive,
} from "lucide-react";

export default function Taskbar({
  toggle,
  explorer,
  terminal,
  extractor,
  restore,
  restoreTerminal,
  restoreExtractor,
  search,
  setSearch,
  searchOpen,
  setSearchOpen,
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="taskbar">

      {/* Start */}
      <button className="phoenix-btn" onClick={toggle}>
        <img
          src="/phoenix.svg"
          className="phoenix-logo"
          alt="VOS"
        />
      </button>

      {/* Search */}
      <button
  className={`search-btn ${searchOpen ? "search-active" : ""}`}
  onClick={() => setSearchOpen(!searchOpen)}
>
  <Search size={18}/>
  <span>Search apps...</span>
</button>

      {/* Running Apps */}
      <div className="running-area">

        {explorer.open && (
          <button
            className={`running-app ${
              !explorer.minimized ? "active-app" : ""
            }`}
            onClick={restore}
            title="Files"
          >
            <Folder size={20} />
            {!explorer.minimized && (
              <div className="active-line" />
            )}
          </button>
        )}

        {terminal.open && (
          <button
            className={`running-app ${
              !terminal.minimized ? "active-app" : ""
            }`}
            onClick={restoreTerminal}
            title="Terminal"
          >
            <Terminal size={20} />
            {!terminal.minimized && (
              <div className="active-line" />
            )}
          </button>
        )}

        {extractor?.open && (
          <button
            className={`running-app ${
              !extractor.minimized ? "active-app" : ""
            }`}
            onClick={restoreExtractor}
            title="RF Extractor"
          >
            <Archive size={20} />
            {!extractor.minimized && (
              <div className="active-line" />
            )}
          </button>
        )}

      </div>

      {/* Clock */}
      <div className="clock">
        {time}
      </div>

    </div>
  );
}