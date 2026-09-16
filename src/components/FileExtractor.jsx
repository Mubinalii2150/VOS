import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  LogOut,
  Archive,
  FolderOpen,
  FileArchive,
  CheckCircle2,
  Activity,
  Database,
  Terminal,
  Radar,
  WifiOff,
  Clock3,
  Cpu,
  HardDrive,
  MemoryStick,
} from "lucide-react";

export default function FileExtractor() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState("analyst");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("Analyst");
  const [time, setTime] = useState("");
  const [signal, setSignal] = useState(97);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    const sig = setInterval(() => {
      setSignal(Math.floor(90 + Math.random() * 10));
    }, 2000);

    return () => {
      clearInterval(clock);
      clearInterval(sig);
    };
  }, []);

  const login = () => {
    if (user === "analyst" && pass === "vos1234") {
      setAuth(true);
    } else {
      alert("Invalid Analyst ID or Password");
    }
  };

  const archives = [
    { name: "VOS_Assets.zip", size: "124 MB" },
    { name: "Icons_Pack.zip", size: "38 MB" },
    { name: "Projects_Backup.zip", size: "512 MB" },
  ];

  /* ================= AUTH SCREEN ================= */

  if (!auth) {
    return (
      <div className="extract-auth">
        <div className="auth-card">
          <ShieldCheck size={50} color="#00F5D4" />

          <h2>VOS</h2>
          <p>NTRO Secure Access Terminal</p>

          <label>Analyst ID</label>
          <div className="input-box">
            <User size={18} />
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="analyst"
            />
          </div>

          <label>Password</label>
          <div className="input-box">
            <Lock size={18} />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Analyst</option>
            <option>Administrator</option>
            <option>Forensic Officer</option>
          </select>

          <button className="auth-btn" onClick={login}>
            AUTHENTICATE
          </button>

          <small>Default : analyst / vos1234</small>
        </div>
      </div>
    );
  }

  /* ================= DASHBOARD ================= */

  return (
    <div className="extractor">
      <div className="extractor-top">
        <div className="extractor-left">
          <Archive size={30} color="#00F5D4" />
          <div>
            <h2>File Extractor</h2>
            <p>Authorized Session • Secure ZIP Extraction</p>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            setAuth(false);
            setPass("");
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="status-bar">
        <div className="status-chip">
          <ShieldCheck size={14} />
          AUTHORIZED
        </div>

        <div className="status-chip offline">
          <WifiOff size={14} />
          Offline Mode
        </div>

        <div className="status-chip">
          <Clock3 size={14} />
          {time}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <Radar size={22} color="#00F5D4" />
          <span>Signal Analyzer</span>
          <h3>{signal}%</h3>
        </div>

        <div className="dash-card">
          <Database size={22} color="#7C3AED" />
          <span>Evidence</span>
          <h3>248</h3>
        </div>

        <div className="dash-card">
          <Activity size={22} color="#22C55E" />
          <span>Mission</span>
          <h3>ACTIVE</h3>
        </div>

        <div className="dash-card">
          <Terminal size={22} color="#F59E0B" />
          <span>Terminal</span>
          <h3>READY</h3>
        </div>
      </div>

      <h3 className="section-title">System Monitor</h3>

      <div className="monitor-grid">
        <div className="monitor-card">
          <Cpu size={20} />
          <div>
            <p>CPU</p>
            <b>34%</b>
          </div>
        </div>

        <div className="monitor-card">
          <MemoryStick size={20} />
          <div>
            <p>RAM</p>
            <b>6.2 / 8 GB</b>
          </div>
        </div>

        <div className="monitor-card">
          <HardDrive size={20} />
          <div>
            <p>Storage</p>
            <b>246 / 512 GB</b>
          </div>
        </div>
      </div>

      <h3 className="section-title">Mission Dashboard</h3>

      <div className="archive-list">
        {archives.map((a) => (
          <div className="archive-card" key={a.name}>
            <div className="archive-info">
              <FileArchive size={20} color="#7C3AED" />
              <div>
                <h4>{a.name}</h4>
                <span>{a.size}</span>
              </div>
            </div>

            <button
              className="extract-btn"
              onClick={() => setDone(true)}
            >
              <FolderOpen size={16} />
              Extract
            </button>
          </div>
        ))}
      </div>

      <div className="secure-terminal">
        <div className="terminal-title">
          <Terminal size={16} />
          Secure Terminal
        </div>

        <div className="terminal-body">
          <p>$ integrity check...</p>
          <p>$ sandbox initialized...</p>
          <p>$ archive verified...</p>
          {done && (
            <p className="success">
              ✓ Extraction completed successfully.
            </p>
          )}
        </div>
      </div>

      {done && (
        <div className="extract-success">
          <CheckCircle2 size={18} />
          All archives extracted successfully.
        </div>
      )}
    </div>
  );
}