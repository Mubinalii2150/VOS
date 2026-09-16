import {
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
} from "lucide-react";

export default function ComputerApp() {
  const drives = [
    { name: "Local Disk (C:)", used: 182, total: 512 },
    { name: "Projects (D:)", used: 64, total: 256 },
  ];

  return (
    <div className="computer">
      <h2>This PC</h2>

      <div className="sys-grid">
        <div className="sys-card">
          <Cpu size={30} color="#00F5D4" />
          <h3>CPU</h3>
          <p>Intel Core i7</p>
        </div>

        <div className="sys-card">
          <MemoryStick size={30} color="#00F5D4" />
          <h3>RAM</h3>
          <p>8 GB</p>
        </div>

        <div className="sys-card">
          <Monitor size={30} color="#00F5D4" />
          <h3>OS</h3>
          <p>VOS 1.0</p>
        </div>
      </div>

      <h3 className="drive-title">Devices & Drives</h3>

      {drives.map((d) => (
        <div className="drive" key={d.name}>
          <div className="drive-head">
            <HardDrive size={22} color="#7C3AED" />
            <span>{d.name}</span>
          </div>

          <div className="drive-bar">
            <div
              className="drive-fill"
              style={{ width: `${(d.used / d.total) * 100}%` }}
            />
          </div>

          <p>{d.used} GB of {d.total} GB used</p>
        </div>
      ))}
    </div>
  );
}