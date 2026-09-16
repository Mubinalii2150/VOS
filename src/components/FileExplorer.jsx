import { useState } from "react";
import {
  Folder,
  FileText,
  Download,
  Image,
  Briefcase,
  Search,
  Grid2X2,
  List,
  ArrowLeft,
  ArrowRight,
  Home,
} from "lucide-react";

export default function FileExplorer() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState("Home");

  const folders = [
    { name: "Documents", icon: FileText, size: "2.3 GB" },
    { name: "Downloads", icon: Download, size: "8.1 GB" },
    { name: "Pictures", icon: Image, size: "4.8 GB" },
    { name: "Projects", icon: Briefcase, size: "1.2 GB" },
  ];

  const filtered = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="explorer">

      {/* Sidebar */}
      <aside className="explorer-sidebar">
        <div className="side-title">Quick Access</div>

        <div className="side-item active">
          <Home size={18}/>
          Home
        </div>

        {folders.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.name}
              className="side-item"
              onClick={() => setCurrent(f.name)}
            >
              <Icon size={18}/>
              {f.name}
            </div>
          );
        })}

        <div className="storage-box">
          <p>Storage</p>
          <div className="storage-bar">
            <div className="storage-fill"></div>
          </div>
          <span>246 GB / 512 GB</span>
        </div>
      </aside>

      {/* Main */}
      <section className="explorer-main">

        {/* Toolbar */}
       <div className="toolbar">
  <div className="nav-btns">
    <button><ArrowLeft size={16}/></button>
    <button><ArrowRight size={16}/></button>
  </div>

  <div className="address-bar">
    <Home size={15}/>
    <span>Home / {current}</span>
  </div>

  <div className="search-box">
    <Search size={16}/>
    <input
      type="text"
      placeholder="Search files..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
    />
  </div>

  <div className="view-btns">
    <button onClick={()=>setView("grid")}>
      <Grid2X2 size={18}/>
    </button>

    <button onClick={()=>setView("list")}>
      <List size={18}/>
    </button>
  </div>
</div>

        {/* Content */}
        {view==="grid" ? (
          <div className="folder-grid">
            {filtered.map((f)=>{
              const Icon=f.icon;
              return(
                <div className="folder-card" key={f.name}>
                  <Folder size={54} color="#00F5D4"/>
                  <h4>{f.name}</h4>
                  <span>{f.size}</span>
                </div>
              );
            })}
          </div>
        ):(
          <div className="file-list">
            {filtered.map((f)=>{
              const Icon=f.icon;
              return(
                <div className="file-row" key={f.name}>
                  <Icon size={22}/>
                  <div>
                    <b>{f.name}</b>
                    <p>Folder</p>
                  </div>
                  <span>{f.size}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}