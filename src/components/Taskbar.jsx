import { useEffect, useState } from "react";
import { Search, Folder, Terminal } from "lucide-react";
import { FolderOpen } from "lucide-react";
export default function Taskbar({
  toggle,
  explorer,
  terminal,
  restore,
  restoreTerminal,
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
      {/* Start Button */}
      <button className="phoenix-btn" onClick={toggle}>
        <img
          src="/phoenix.svg"
          className="phoenix-logo"
          alt="VOS"
        />
      </button>

      {/* Search Bar */}
      <div className="search">
        <Search size={18} />
        <span>Search apps...</span>
      </div>

      {/* Running Apps */}
      <div className="running-area">
        {explorer.open && (
          <button
            className={`running-app ${
              !explorer.minimized ? "active-app" : ""
            }`}
            onClick={restore}
          >
            <Folder size={20} />
          </button>
        )}

        {terminal.open && (
          <button
            className={`running-app ${
              !terminal.minimized ? "active-app" : ""
            }`}
            onClick={restoreTerminal}
          >
            <Terminal size={20} />
          </button>
        )}
      </div>

      {/* Clock */}
      <div className="clock">{time}</div>
    </div>
  );
}