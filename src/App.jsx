import { useEffect, useMemo, useState } from "react";



import {

  FolderOpen,

  Monitor,

  Settings,

  Terminal,

  Archive,

} from "lucide-react";



import TopBar from "./components/TopBar";

import Taskbar from "./components/Taskbar";

import SearchPanel from "./components/SearchPanel";

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

import SnapLayoutV2 from "./components/SnapLayoutV2";



const SNAP_LAYOUTS = [

  { id: "two", columns: 2, rows: 1, slots: [

    { id: "slot-0", col: 1, row: 1 },

    { id: "slot-1", col: 2, row: 1 },

  ]},

  { id: "left-wide", columns: 3, rows: 1, slots: [

    { id: "slot-0", col: 1, row: 1, span: 2 },

    { id: "slot-1", col: 3, row: 1 },

  ]},

  { id: "right-wide", columns: 3, rows: 1, slots: [

    { id: "slot-0", col: 1, row: 1 },

    { id: "slot-1", col: 2, row: 1, span: 2 },

  ]},

  { id: "three", columns: 3, rows: 1, slots: [

    { id: "slot-0", col: 1, row: 1 },

    { id: "slot-1", col: 2, row: 1 },

    { id: "slot-2", col: 3, row: 1 },

  ]},

  { id: "four", columns: 2, rows: 2, slots: [

    { id: "slot-0", col: 1, row: 1 },

    { id: "slot-1", col: 2, row: 1 },

    { id: "slot-2", col: 1, row: 2 },

    { id: "slot-3", col: 2, row: 2 },

  ]},

  { id: "large-left", columns: 3, rows: 2, slots: [

    { id: "slot-0", col: 1, row: 1, span: 2, rowSpan: 2 },

    { id: "slot-1", col: 3, row: 1 },

    { id: "slot-2", col: 3, row: 2 },

  ]},

];



export default function App() {



  const handleSnapArrange = (slots, layout) => {
    if (!layout) return;

    const TOPBAR = 58;
    const TASKBAR = 58;
    const GAP = 0;

    const workspaceWidth = window.innerWidth;
    const workspaceHeight = Math.max(
      260,
      window.innerHeight - TOPBAR - TASKBAR
    );

    const columns = Math.max(1, layout.columns || 1);
    const rows = Math.max(1, layout.rows || 1);

    const cellWidth =
      (workspaceWidth - GAP * (columns + 1)) / columns;

    const cellHeight =
      (workspaceHeight - GAP * (rows + 1)) / rows;

    setWindows((prev) => {
      const next = { ...prev };

      layout.slots.forEach((slot, index) => {
        const appId = slots?.[slot.id];

        if (!appId || !next[appId]) return;

        const span = slot.span || 1;
        const rowSpan = slot.rowSpan || 1;

        const rect = {
          x:
            GAP +
            (slot.col - 1) * (cellWidth + GAP),

          y:
            TOPBAR +
            GAP +
            (slot.row - 1) * (cellHeight + GAP),

          width:
            cellWidth * span +
            GAP * (span - 1),

          height:
            cellHeight * rowSpan +
            GAP * (rowSpan - 1),
        };

        next[appId] = {
          ...next[appId],
          open: true,
          minimized: false,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          snapRect: rect,
          z: 1000 + (layout.slots.length - index),
        };
      });

      return next;
    });

    // Keep Snap Layout open so the user can change layouts and swaps repeatedly.
    const firstAppId = Object.values(slots || {}).find(Boolean);

    if (firstAppId) {
      setSelectedAppId(firstAppId);

      setTopZ((current) => {
        const nextZ = current + 1;

        setWindows((prev) => {
          if (!prev[firstAppId]) return prev;

          return {
            ...prev,
            [firstAppId]: {
              ...prev[firstAppId],
              z: nextZ,
            },
          };
        });

        return nextZ;
      });
    }
  };

  /* =========================================================

     BOOT / LOGIN

  ========================================================= */

  const [booting, setBooting] = useState(true);

  const [locked, setLocked] = useState(true);

  const [loggedIn, setLoggedIn] = useState(false);



  /* =========================================================

     DESKTOP

  ========================================================= */

  const [menu, setMenu] = useState(false);

  const [theme, setTheme] = useState("dark");

  const [wallpaper, setWallpaper] = useState("/wallpaper.jpg");

  const [search, setSearch] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);



  /* =========================================================

     SYSTEM

  ========================================================= */

  const [volume, setVolume] = useState(70);

  const [wifi, setWifi] = useState(true);

  const [airplane, setAirplane] = useState(false);

  const [analysis, setAnalysis] = useState(null);



  /* =========================================================

     CONTEXT MENU

  ========================================================= */

  const [ctx, setCtx] = useState({

    show: false,

    x: 0,

    y: 0,

  });



  /* =========================================================

     SNAP LAYOUT

  ========================================================= */

  const [snapLayoutOpen, setSnapLayoutOpen] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState(null);



  /*

    Every window has its own:

      open

      minimized

      z

      x / y

      width / height



    x/y/width/height are used by the snap system.

    The existing Window component can continue working with

    its own drag state; snap data is kept here for future

    Window integration.

  */

  const [windows, setWindows] = useState({

    explorer: {

      open: false,

      minimized: false,

      z: 101,

      x: 180,

      y: 90,

      width: 900,

      height: 600,

      snapRect: null,

    },



    computer: {

      open: false,

      minimized: false,

      z: 102,

      x: 210,

      y: 110,

      width: 900,

      height: 600,

      snapRect: null,

    },



    settings: {

      open: false,

      minimized: false,

      z: 103,

      x: 240,

      y: 130,

      width: 850,

      height: 600,

      snapRect: null,

    },



    terminal: {

      open: false,

      minimized: false,

      z: 104,

      x: 160,

      y: 80,

      width: 950,

      height: 600,

      snapRect: null,

    },



    extractor: {

      open: false,

      minimized: false,

      z: 105,

      x: 200,

      y: 100,

      width: 950,

      height: 620,

      snapRect: null,

    },

  });



  const [topZ, setTopZ] = useState(105);



  /* =========================================================

     WINDOW HELPERS

  ========================================================= */



  const bringToFront = (id) => {

    setTopZ((current) => {

      const next = current + 1;



      setWindows((prev) => {

        if (!prev[id]) return prev;



        return {

          ...prev,

          [id]: {

            ...prev[id],

            z: next,

            minimized: false,

          },

        };

      });



      return next;

    });



    setSelectedAppId(id);

  };



  const openWindow = (id) => {

    setTopZ((current) => {

      const next = current + 1;



      setWindows((prev) => ({

        ...prev,

        [id]: {

          ...prev[id],

          open: true,

          minimized: false,

          z: next,

          snapRect: null,

        },

      }));



      return next;

    });



    setSelectedAppId(id);

    setMenu(false);

    setSearchOpen(false);

  };



  const closeWindow = (id) => {

    setWindows((prev) => ({

      ...prev,

      [id]: {

        ...prev[id],

        open: false,

        minimized: false,

        snapRect: null,

      },

    }));



    if (selectedAppId === id) {

      setSelectedAppId(null);

    }

  };



  const minimizeWindow = (id) => {

    setWindows((prev) => ({

      ...prev,

      [id]: {

        ...prev[id],

        minimized: true,

      },

    }));

  };



  const restoreWindow = (id) => {

    openWindow(id);

  };



  /* =========================================================

     APP OPEN FUNCTIONS

  ========================================================= */



  const openExplorer = () => openWindow("explorer");

  const openComputer = () => openWindow("computer");

  const openSettings = () => openWindow("settings");

  const openTerminal = () => openWindow("terminal");

  const openExtractor = () => openWindow("extractor");



  /* =========================================================

     RUNNING APPLICATIONS



     SnapLayout receives ONLY currently running applications.

     Minimized applications remain "running", so they can still

     be selected from the snap layout.

  ========================================================= */



  const runningApps = useMemo(

    () => [

      {

        id: "explorer",

        title: "File Explorer",

        icon: FolderOpen,

        running: windows.explorer.open,

      },

      {

        id: "computer",

        title: "This PC",

        icon: Monitor,

        running: windows.computer.open,

      },

      {

        id: "settings",

        title: "Settings",

        icon: Settings,

        running: windows.settings.open,

      },

      {

        id: "terminal",

        title: "Phoenix Terminal",

        icon: Terminal,

        running: windows.terminal.open,

      },

      {

        id: "extractor",

        title: "File Extractor",

        icon: Archive,

        running: windows.extractor.open,

      },

    ].filter((app) => app.running),

    [windows]

  );



  /* =========================================================

     SNAP LAYOUT ARRANGEMENT



     The SnapLayout gives:

       slot-0 -> app id

       slot-1 -> app id

       ...



     This function:

       1. Opens the selected/running apps.

       2. Swaps applications automatically.

       3. Stores their snap geometry.

  ========================================================= */



  /* =========================================================

     OPEN SNAP LAYOUT



     Keyboard:

       Win + Z

       Ctrl + Shift + Space



     This makes SnapLayout usable immediately even before the

     Window component's maximize button is wired to App.jsx.

  ========================================================= */



  const openSnapLayout = () => {

    const running = runningApps;



    if (!running.length) {

      return;

    }



    const topRunning = [...running].sort(

      (a, b) =>

        (windows[b.id]?.z || 0) -

        (windows[a.id]?.z || 0)

    )[0];



    setSelectedAppId(

      topRunning?.id || running[0]?.id || null

    );



    setSnapLayoutOpen(true);

  };



  const closeSnapLayout = () => {

    setSnapLayoutOpen(false);

    setSelectedAppId(null);

  };



  useEffect(() => {

    const handleShortcut = (e) => {

      /*

        Win + Z is the Windows-style snap shortcut.

      */

      if (e.key.toLowerCase() === "z" && e.metaKey) {

        e.preventDefault();

        openSnapLayout();

        return;

      }



      /*

        Ctrl + Shift + Space is an easy browser-safe shortcut.

      */

      if (

        e.ctrlKey &&

        e.shiftKey &&

        e.code === "Space"

      ) {

        e.preventDefault();

        openSnapLayout();

        return;

      }



      if (e.key === "Escape") {

        setSearchOpen(false);

        setMenu(false);

        closeSnapLayout();



        setCtx((prev) => ({

          ...prev,

          show: false,

        }));

      }

    };



    window.addEventListener("keydown", handleShortcut);



    return () => {

      window.removeEventListener("keydown", handleShortcut);

    };

  }, [runningApps, windows]);



  /* =========================================================

     DOUBLE CLICK / CUSTOM EVENT SUPPORT



     If Window.jsx later dispatches:

       window.dispatchEvent(

         new CustomEvent("vos:open-snap-layout")

       )



     this App will automatically open SnapLayout.

  ========================================================= */



  useEffect(() => {

    const handler = () => openSnapLayout();



    window.addEventListener(

      "vos:open-snap-layout",

      handler

    );



    return () => {

      window.removeEventListener(

        "vos:open-snap-layout",

        handler

      );

    };

  }, [runningApps, windows]);



  /* =========================================================

     ESCAPE / CONTEXT MENU

  ========================================================= */



  const openContext = (e) => {

    e.preventDefault();



    setCtx({

      show: true,

      x: e.clientX,

      y: e.clientY,

    });



    setMenu(false);

  };



  const closeContext = () => {

    setCtx((prev) => ({

      ...prev,

      show: false,

    }));

  };



  /* =========================================================

     ALT + TAB

  ========================================================= */



  useEffect(() => {

    const handleAltTab = (e) => {

      if (!e.altKey || e.key !== "Tab") return;



      e.preventDefault();



      const opened = Object.entries(windows)

        .filter(([, state]) => state.open)

        .sort((a, b) => b[1].z - a[1].z);



      if (opened.length < 2) return;



      const currentIndex = opened.findIndex(

        ([id]) => id === selectedAppId

      );



      const nextIndex =

        currentIndex < 0

          ? 0

          : (currentIndex + 1) % opened.length;



      const nextId = opened[nextIndex][0];



      bringToFront(nextId);

    };



    window.addEventListener("keydown", handleAltTab);



    return () => {

      window.removeEventListener("keydown", handleAltTab);

    };

  }, [windows, selectedAppId]);





  /* =========================================================

     SEARCH

  ========================================================= */



  const apps = [

    { name: "Files", action: openExplorer },

    { name: "Computer", action: openComputer },

    { name: "Settings", action: openSettings },

    { name: "Terminal", action: openTerminal },

    { name: "Extractor", action: openExtractor },

  ];



  /* =========================================================

     BOOT / LOCK / LOGIN

  ========================================================= */



  if (booting) {

    return (

      <BootScreen

        finish={() => setBooting(false)}

      />

    );

  }



  if (locked) {

    return (

      <LockScreen

        unlock={() => setLocked(false)}

      />

    );

  }



  if (!loggedIn) {

    return (

      <LoginScreen

        login={() => setLoggedIn(true)}

      />

    );

  }



  /* =========================================================

     DESKTOP

  ========================================================= */



  return (

    <div

      className={`desktop ${theme}`}

      onContextMenu={openContext}

      onClick={(e) => {

        if (e.target === e.currentTarget) {

          closeContext();

          setMenu(false);

        }

      }}

    >

      {/* WALLPAPER */}

      <img

        src={wallpaper}

        className="wallpaper"

        alt="VOS wallpaper"

      />



      {/* TOP BAR */}

      <TopBar

        volume={volume}

        setVolume={setVolume}

        wifi={wifi}

        setWifi={setWifi}

        airplane={airplane}

        setAirplane={setAirplane}

      />



      {/* DESKTOP ICONS */}

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



      {/* SEARCH RESULTS */}

      {search !== "" && !searchOpen && (

        <div className="search-results">

          {apps

            .filter((app) =>

              app.name

                .toLowerCase()

                .includes(search.toLowerCase())

            )

            .map((app) => (

              <button

                key={app.name}

                type="button"

                className="search-item"

                onClick={(e) => {

                  e.stopPropagation();

                  app.action();

                  setSearch("");

                }}

              >

                {app.name}

              </button>

            ))}

        </div>

      )}



      {/* START MENU */}

      {menu && (

        <PhoenixMenu

          openExplorer={openExplorer}

          openSettings={openSettings}

          openTerminal={openTerminal}

        />

      )}



      {/* CONTEXT MENU */}

      {ctx.show && (

        <ContextMenu

          x={ctx.x}

          y={ctx.y}

          close={closeContext}

        />

      )}



      {/* =====================================================

          WINDOWS

      ===================================================== */}



      {windows.explorer.open &&

        !windows.explorer.minimized && (

          <Window

            title="File Explorer"

            zIndex={windows.explorer.z}
            x={windows.explorer.x}
            y={windows.explorer.y}
            width={windows.explorer.width}
            height={windows.explorer.height}
            onMove={(nextPosition) =>
              setWindows((prev) => ({
                ...prev,
                explorer: {
                  ...prev.explorer,
                  x: nextPosition.x,
                  y: nextPosition.y,
                },
              }))
            }

            onFocus={() => bringToFront("explorer")}

            onClose={() => closeWindow("explorer")}

            onMinimize={() => minimizeWindow("explorer")}

            onMaximize={openSnapLayout}

          >

            <FileExplorer />

          </Window>

        )}



      {windows.computer.open &&

        !windows.computer.minimized && (

          <Window

            title="This PC"

            zIndex={windows.computer.z}
            x={windows.computer.x}
            y={windows.computer.y}
            width={windows.computer.width}
            height={windows.computer.height}
            onMove={(nextPosition) =>
              setWindows((prev) => ({
                ...prev,
                computer: {
                  ...prev.computer,
                  x: nextPosition.x,
                  y: nextPosition.y,
                },
              }))
            }

            onFocus={() => bringToFront("computer")}

            onClose={() => closeWindow("computer")}

            onMinimize={() => minimizeWindow("computer")}

            onMaximize={openSnapLayout}

          >

            <ComputerApp />

          </Window>

        )}



      {windows.settings.open &&

        !windows.settings.minimized && (

          <Window

            title="Settings"

            zIndex={windows.settings.z}
            x={windows.settings.x}
            y={windows.settings.y}
            width={windows.settings.width}
            height={windows.settings.height}
            onMove={(nextPosition) =>
              setWindows((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  x: nextPosition.x,
                  y: nextPosition.y,
                },
              }))
            }

            onFocus={() => bringToFront("settings")}

            onClose={() => closeWindow("settings")}

            onMinimize={() => minimizeWindow("settings")}

            onMaximize={openSnapLayout}

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



      {windows.terminal.open &&

        !windows.terminal.minimized && (

          <Window

            title="Phoenix Terminal"

            zIndex={windows.terminal.z}
            x={windows.terminal.x}
            y={windows.terminal.y}
            width={windows.terminal.width}
            height={windows.terminal.height}
            onMove={(nextPosition) =>
              setWindows((prev) => ({
                ...prev,
                terminal: {
                  ...prev.terminal,
                  x: nextPosition.x,
                  y: nextPosition.y,
                },
              }))
            }

            onFocus={() => bringToFront("terminal")}

            onClose={() => closeWindow("terminal")}

            onMinimize={() => minimizeWindow("terminal")}

            onMaximize={openSnapLayout}

          >

            <TerminalApp />

          </Window>

        )}



      {windows.extractor.open &&

        !windows.extractor.minimized && (

          <Window

            title="File Extractor"

            zIndex={windows.extractor.z}
            x={windows.extractor.x}
            y={windows.extractor.y}
            width={windows.extractor.width}
            height={windows.extractor.height}
            onMove={(nextPosition) =>
              setWindows((prev) => ({
                ...prev,
                extractor: {
                  ...prev.extractor,
                  x: nextPosition.x,
                  y: nextPosition.y,
                },
              }))
            }

            onFocus={() => bringToFront("extractor")}

            onClose={() => closeWindow("extractor")}

            onMinimize={() => minimizeWindow("extractor")}

            onMaximize={openSnapLayout}

          >

            <FileExtractor

              analysis={analysis}

              setAnalysis={setAnalysis}

            />

          </Window>

        )}



      {/* =====================================================

          SNAP LAYOUT



          Only currently running applications are shown.

          The component itself handles swapping/slot selection.

      ===================================================== */}

      <SnapLayoutV2

        open={snapLayoutOpen}

        runningApps={runningApps}

        selectedAppId={selectedAppId}

        onArrange={handleSnapArrange}

        onClose={closeSnapLayout}

      />



      {/* SEARCH PANEL */}

      <SearchPanel

        open={searchOpen}

        search={search}

        setSearch={setSearch}

        openExplorer={() => {

          openExplorer();

          setSearchOpen(false);

        }}

        openSettings={() => {

          openSettings();

          setSearchOpen(false);

        }}

        openTerminal={() => {

          openTerminal();

          setSearchOpen(false);

        }}

      />



      {/* TASKBAR */}

      <Taskbar

        toggle={() => setMenu((value) => !value)}



        explorer={windows.explorer}

        computer={windows.computer}

        settings={windows.settings}

        terminal={windows.terminal}

        extractor={windows.extractor}



        restore={() => restoreWindow("explorer")}

        restoreComputer={() => restoreWindow("computer")}

        restoreSettings={() => restoreWindow("settings")}

        restoreTerminal={() => restoreWindow("terminal")}

        restoreExtractor={() => restoreWindow("extractor")}



        search={search}

        setSearch={setSearch}

        searchOpen={searchOpen}

        setSearchOpen={setSearchOpen}

      />



      {/* =====================================================

          SNAP HELPER BUTTON



          It appears only while at least one application is

          running. This is intentionally small and does not

          replace your existing UI.

      ===================================================== */}

      {runningApps.length > 0 && (

        <button

          type="button"

          className="vos-snap-launcher"

          onClick={(e) => {

            e.stopPropagation();

            openSnapLayout();

          }}

          title="Open Snap Layout"

          aria-label="Open Snap Layout"

        >

          ▦

        </button>

      )}

    </div>

  );

}
