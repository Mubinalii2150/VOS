import { useState } from "react";
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
} from "lucide-react";

export default function FileExplorer() {
  const data = {
    Home: [
      { name: "Documents", size: "2.3 GB" },
      { name: "Downloads", size: "8.1 GB" },
      { name: "Pictures", size: "4.8 GB" },
      { name: "Projects", size: "1.2 GB" },
    ],
    Documents: [
      { name: "Mission_Report.pdf", size: "12 MB" },
      { name: "Evidence.docx", size: "2 MB" },
      { name: "Notes.txt", size: "320 KB" },
    ],
    Downloads: [
      { name: "SignalAnalyzer.zip", size: "180 MB" },
      { name: "PhoenixOS.iso", size: "1.8 GB" },
    ],
    Pictures: [
      { name: "Drone.png", size: "4.2 MB" },
      { name: "Satellite.jpg", size: "6.1 MB" },
    ],
    Projects: [
      { name: "VOS", size: "1.2 GB" },
      { name: "RF Engine", size: "820 MB" },
    ],
  };

  const [current, setCurrent] = useState("Home");
  const [history, setHistory] = useState(["Home"]);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState(true);

  const openFolder = (name) => {
    if (!data[name]) return;
    const newHistory = [...history.slice(0, index + 1), name];
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
    setCurrent(name);
    setSearch("");
  };

  const goBack = () => {
    if (index === 0) return;
    setCurrent(history[index - 1]);
    setIndex(index - 1);
  };

  const goForward = () => {
    if (index >= history.length - 1) return;
    setCurrent(history[index + 1]);
    setIndex(index + 1);
  };

  const items = data[current].filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="explorer">
      {/* Sidebar */}
      <aside className="explorer-sidebar">
        <p className="side-title">QUICK ACCESS</p>

        <button
          className={current === "Home" ? "side-btn active" : "side-btn"}
          onClick={() => openFolder("Home")}
        >
          <Home size={18} />
          Home
        </button>

        <button
          className={current === "Documents" ? "side-btn active" : "side-btn"}
          onClick={() => openFolder("Documents")}
        >
          <FileText size={18} />
          Documents
        </button>

        <button
          className={current === "Downloads" ? "side-btn active" : "side-btn"}
          onClick={() => openFolder("Downloads")}
        >
          <Download size={18} />
          Downloads
        </button>

        <button
          className={current === "Pictures" ? "side-btn active" : "side-btn"}
          onClick={() => openFolder("Pictures")}
        >
          <Image size={18} />
          Pictures
        </button>

        <button
          className={current === "Projects" ? "side-btn active" : "side-btn"}
          onClick={() => openFolder("Projects")}
        >
          <Briefcase size={18} />
          Projects
        </button>

        <div className="storage-box">
          <span>Storage</span>

          <div className="storage-bar">
            <div className="storage-fill"></div>
          </div>

          <small>246 GB / 512 GB</small>
        </div>
      </aside>

      {/* Main */}
      <section className="explorer-main">
        {/* Toolbar */}
        <div className="toolbar">
          <button className="tool-btn" onClick={goBack}>
            <ArrowLeft size={18} />
          </button>

          <button className="tool-btn" onClick={goForward}>
            <ArrowRight size={18} />
          </button>

          <div className="path-bar">
            <Home size={16} />
            <span>Home / {current}</span>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="tool-btn" onClick={() => setGrid(true)}>
            <Grid2X2 size={18} />
          </button>

          <button className="tool-btn" onClick={() => setGrid(false)}>
            <List size={18} />
          </button>
        </div>

        {/* Files */}
        <div className={grid ? "file-grid" : "file-list"}>
          {items.map((item) => (
            <div
              key={item.name}
              className={grid ? "file-card" : "list-row"}
              onDoubleClick={() => openFolder(item.name)}
            >
              <Folder size={48} className="folder-icon" />

              <div>
                <h4>{item.name}</h4>
                <span>{item.size}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}