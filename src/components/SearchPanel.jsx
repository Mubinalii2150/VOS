import {
  Search,
  Folder,
  Settings,
  Terminal,
  Globe,
  Clock3,
} from "lucide-react";

export default function SearchPanel({
  open,
  search,
  setSearch,
  openExplorer,
  openSettings,
  openTerminal,
}) {
  if (!open) return null;

  const recent = [
    { name: "Files", icon: Folder, action: openExplorer },
    { name: "Terminal", icon: Terminal, action: openTerminal },
    { name: "Settings", icon: Settings, action: openSettings },
    { name: "Downloads", icon: Folder, action: openExplorer },
    { name: "Computer", icon: Folder, action: openExplorer },
  ];

  const quick = [
    "Weather today",
    "Top news",
    "Gold rate today",
    "Trending",
    "Open Web results",
  ];

  return (
    <div className="search-overlay">
      <div className="search-panel">

        <div className="panel-head">
          <Search size={18}/>
          <input
            autoFocus
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search apps, files, settings, web"
          />
        </div>

        <div className="panel-tabs">
          <span className="active">All</span>
          <span>Apps</span>
          <span>Files</span>
          <span>Settings</span>
          <span>Web</span>
        </div>

        <div className="panel-grid">

          <div>
            <h4>Recent</h4>

            {recent
              .filter(i =>
                i.name.toLowerCase().includes(search.toLowerCase())
              )
              .map(item => (
                <button
                  key={item.name}
                  className="panel-item"
                  onClick={item.action}
                >
                  <item.icon size={18}/>
                  {item.name}
                </button>
              ))}
          </div>

          <div>
            <h4>Quick searches</h4>

            {quick
              .filter(q =>
                q.toLowerCase().includes(search.toLowerCase())
              )
              .map(q => (
                <div className="quick-item" key={q}>
                  <Globe size={16}/>
                  {q}
                </div>
              ))}
          </div>

        </div>

        <div className="panel-footer">
          <Clock3 size={15}/>
          Press Enter to search the web
        </div>

      </div>
    </div>
  );
}