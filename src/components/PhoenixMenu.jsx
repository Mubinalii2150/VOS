import {
  Folder,
  Monitor,
  Settings,
  Terminal,
  Power,
} from "lucide-react";
import { FolderOpen } from "lucide-react";
export default function PhoenixMenu({
  openExplorer,
  openSettings,
  openTerminal,
}) {
  return (
    
    <div className="phoenix-menu">
      <div className="menu-item" onClick={openExplorer}>
  <Folder size={20}/>
  Files
</div>

<div className="menu-item">
  <Monitor size={20}/>
  Computer
</div>

<div className="menu-item" onClick={openSettings}>
  <Settings size={20}/>
  Settings
</div>

<div className="menu-item" onClick={openTerminal}>
  <Terminal size={20}/>
  Terminal
</div>

<div className="shutdown">
  <Power size={18}/>
  Shut Down
</div>
    </div>
  );
}