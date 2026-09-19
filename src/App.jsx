
import { useState } from "react";
import {
  FolderOpen,
  Monitor,
  Settings,
  Terminal,
  Archive,
} from "lucide-react";

import TopBar from "./components/TopBar";
import Taskbar from "./components/Taskbar";
import PhoenixMenu from "./components/PhoenixMenu";
import DesktopIcon from "./components/DesktopIcon";
import Window from "./components/Window";
import FileExplorer from "./components/FileExplorer";
import ComputerApp from "./components/ComputerApp";
import FileExtractor from "./components/FileExtractor";
import ContextMenu from "./components/ContextMenu";
import SettingsApp from "./components/SettingsApp";
import TerminalApp from "./components/TerminalApp";
import LockScreen from "./components/LockScreen";
import LoginScreen from "./components/LoginScreen";
import BootScreen from "./components/BootScreen";

export default function App() {
  /* ---------------- Boot & Login ---------------- */
  const [booting, setBooting] = useState(true);
  const [locked, setLocked] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  /* ---------------- Desktop ---------------- */
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("dark");
  const [wallpaper, setWallpaper] = useState("/wallpaper.jpg");

  /* ---------------- System ---------------- */
  const [volume, setVolume] = useState(70);
  const [wifi, setWifi] = useState(true);
  const [airplane, setAirplane] = useState(false);
const [analysis, setAnalysis] = useState(null);
  /* ---------------- Context Menu ---------------- */
  const [ctx, setCtx] = useState({
    show: false,
    x: 0,
    y: 0,
  });

  /* ---------------- Windows ---------------- */
  const [explorer, setExplorer] = useState({
    open: false,
    minimized: false,
  });

  const [computer, setComputer] = useState({
    open: false,
    minimized: false,
  });

  const [settings, setSettings] = useState({
    open: false,
    minimized: false,
  });

  const [terminal, setTerminal] = useState({
    open: false,
    minimized: false,
  });

  const [extractor, setExtractor] = useState({
    open: false,
    minimized: false,
  });

  /* ---------------- Open Functions ---------------- */

  const openExplorer = () => {
    setExplorer({ open: true, minimized: false });
    setMenu(false);
  };

  const openComputer = () => {
    setComputer({ open: true, minimized: false });
    setMenu(false);
  };

  const openSettings = () => {
    setSettings({ open: true, minimized: false });
    setMenu(false);
  };

  const openTerminal = () => {
    setTerminal({ open: true, minimized: false });
    setMenu(false);
  };

  const openExtractor = () => {
    setExtractor({ open: true, minimized: false });
    setMenu(false);
  };

  const openContext = (e) => {
    e.preventDefault();

    setCtx({
      show: true,
      x: e.clientX,
      y: e.clientY,
    });

    setMenu(false);
  };

  /* ---------------- Search Apps ---------------- */

  const apps = [
    { name: "Files", action: openExplorer },
    { name: "Computer", action: openComputer },
    { name: "Settings", action: openSettings },
    { name: "Terminal", action: openTerminal },
    { name: "Extractor", action: openExtractor },
  ];

  /* ---------------- Boot Screens ---------------- */

  if (booting)
    return <BootScreen finish={() => setBooting(false)} />;

  if (locked)
    return <LockScreen unlock={() => setLocked(false)} />;

  if (!loggedIn)
    return <LoginScreen login={() => setLoggedIn(true)} />;

  /* ---------------- Desktop ---------------- */

  return (
    <div
      className={`desktop ${theme}`}
      onContextMenu={openContext}
      onClick={() => setCtx({ ...ctx, show: false })}
    >
      {/* Wallpaper */}
      <img
        src={wallpaper}
        className="wallpaper"
        alt="wallpaper"
      />

      {/* Top Bar */}
      <TopBar
  volume={volume}
  setVolume={setVolume}
  wifi={wifi}
  setWifi={setWifi}
  airplane={airplane}
  setAirplane={setAirplane}
/>

      {/* Desktop Icons */}
      <div className="icons">
        <DesktopIcon
          icon={FolderOpen}
          name="Files"
          onOpen={openExplorer}
        />

        <DesktopIcon
          icon={Monitor}
          name="Computer"
          onOpen={openComputer}
        />

        <DesktopIcon
          icon={Settings}
          name="Settings"
          onOpen={openSettings}
        />

        <DesktopIcon
          icon={Terminal}
          name="Terminal"
          onOpen={openTerminal}
        />

        <DesktopIcon
          icon={Archive}
          name="Extractor"
          onOpen={openExtractor}
        />
      </div>

      {/* Search Results */}
      {search !== "" && (
        <div className="search-results">
          {apps
            .filter((app) =>
              app.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((app) => (
              <div
                key={app.name}
                className="search-item"
                onClick={() => {
                  app.action();
                  setSearch("");
                }}
              >
                {app.name}
              </div>
            ))}
        </div>
      )}

      {/* Start Menu */}
      {menu && (
        <PhoenixMenu
          openExplorer={openExplorer}
          openSettings={openSettings}
          openTerminal={openTerminal}
        />
      )}

      {/* Context Menu */}
      {ctx.show && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          close={() =>
            setCtx({
              ...ctx,
              show: false,
            })
          }
        />
      )}

      {/* Computer */}
      {computer.open && !computer.minimized && (
        <Window
          title="This PC"
          onClose={() =>
            setComputer({
              open: false,
              minimized: false,
            })
          }
          onMinimize={() =>
            setComputer({
              open: true,
              minimized: true,
            })
          }
        >
          <ComputerApp />
        </Window>
      )}

      {/* File Explorer */}
      {explorer.open && !explorer.minimized && (
        <Window
          title="File Explorer"
          onClose={() =>
            setExplorer({
              open: false,
              minimized: false,
            })
          }
          onMinimize={() =>
            setExplorer({
              open: true,
              minimized: true,
            })
          }
        >
          <FileExplorer />
        </Window>
      )}

      {/* Settings */}
      {settings.open && !settings.minimized && (
        <Window
          title="Settings"
          onClose={() =>
            setSettings({
              open: false,
              minimized: false,
            })
          }
          onMinimize={() =>
            setSettings({
              open: true,
              minimized: true,
            })
          }
        >
          <SettingsApp
            theme={theme}
            setTheme={setTheme}
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            volume={volume}
            setVolume={setVolume}
            wifi={wifi}
            setWifi={setWifi}
            airplane={airplane}
            setAirplane={setAirplane}
          />
        </Window>
      )}

      {/* Terminal */}
      {terminal.open && !terminal.minimized && (
        <Window
          title="Phoenix Terminal"
          onClose={() =>
            setTerminal({
              open: false,
              minimized: false,
            })
          }
          onMinimize={() =>
            setTerminal({
              open: true,
              minimized: true,
            })
          }
        >
          <TerminalApp />
        </Window>
      )}

      {/* Extractor */}
     {/* File Extractor */}
<Window
  title="File Extractor"
  hidden={!extractor.open || extractor.minimized}
  onClose={() =>
    setExtractor({
      open: false,
      minimized: false,
    })
  }
  onMinimize={() =>
    setExtractor({
      open: true,
      minimized: true,
    })
  }
>
  <FileExtractor />
</Window>

      {/* Taskbar */}
      <Taskbar
        toggle={() => setMenu(!menu)}
        explorer={explorer}
        terminal={terminal}
        restore={() =>
          setExplorer({
            open: true,
            minimized: false,
          })
        }
        restoreTerminal={() =>
          setTerminal({
            open: true,
            minimized: false,
          })
        }
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
}