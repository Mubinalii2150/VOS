import { useState, useEffect, useRef } from "react";
import {
  Upload,
  ShieldCheck,
  Lock,
  User,
  LogOut,
  Archive,
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

const API = "http://127.0.0.1:5000";
import ThreatGauge from "./ThreatGauge";

export default function FileExtractor() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState("analyst");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("Analyst");

  const [time, setTime] = useState("");
  const [signal, setSignal] = useState(96);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [files, setFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const fileRef = useRef(null);

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
    }, 2500);

    return () => {
      clearInterval(clock);
      clearInterval(sig);
    };
  }, []);

  const login = () => {
    if (user === "analyst" && pass === "vos1234") {
      setAuth(true);
      setError("");
    } else {
      setError("Invalid Analyst ID or Password");
    }
  };

 const uploadFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setLoading(true);
  setDone(false);
  setError("");

  try {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API}/analyze`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok || data.status !== "success") {
      throw new Error(data.error || "Analysis Failed");
    }

    const f = data.features || {};
    const img = data.images || {};

    setAnalysis({
      signal_strength: f.signal_strength ?? 0,
      center_frequency: f.center_frequency ?? "N/A",
      bandwidth: f.bandwidth ?? "N/A",
      security_score: f.security_score ?? 0,
      threat: f.threat ?? "UNKNOWN",

      snr: f.snr ?? 0,
      noise_floor: f.noise_floor ?? 0,
      dynamic_range: f.dynamic_range ?? 0,
      rms_power: f.rms_power ?? 0,

      fft: img.fft ? `${API}${img.fft}?t=${Date.now()}` : "",
      spectrogram: img.spectrogram
        ? `${API}${img.spectrogram}?t=${Date.now()}`
        : "",
      waterfall: img.waterfall
        ? `${API}${img.waterfall}?t=${Date.now()}`
        : "",
      waveform: img.waveform
        ? `${API}${img.waveform}?t=${Date.now()}`
        : "",
    });

    setFiles((prev) => [
      {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        analyzed: true,
      },
      ...prev,
    ]);

    setDone(true);
  } catch (err) {
    console.error(err);
    setError(err.message || "Upload Failed");
  } finally {
    setLoading(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }
};
    if (!auth) {
    return (
      <div className="extract-auth">
        <div className="auth-card">
          <ShieldCheck size={52} color="#00F5D4" />

          <h2>VOS</h2>
          <p>NTRO Secure Access Terminal</p>

          <label>Analyst ID</label>
          <div className="input-box">
            <User size={18} />
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <label>Password</label>
          <div className="input-box">
            <Lock size={18} />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
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

          {error && (
            <p style={{ color: "#EF4444", fontSize: 13 }}>{error}</p>
          )}

          <button className="auth-btn" onClick={login}>
            AUTHENTICATE
          </button>

          <small>Default: analyst / vos1234</small>
        </div>
      </div>
    );
  }

  return (
    <div className="extractor">
      <div className="extractor-top">
        <div className="extractor-left">
          <Archive size={30} color="#00F5D4" />
          <div>
            <h2>File Extractor</h2>
            <p>RF Intelligence Engine</p>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            setAuth(false);
            setPass("");
            setAnalysis(null);
            setFiles([]);
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
          OFFLINE
        </div>

        <div className="status-chip">
          <Clock3 size={14} />
          {time}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <Radar size={22} color="#00F5D4" />
          <span>Signal</span>
          <h3>{signal}%</h3>
        </div>

        <div className="dash-card">
          <Database size={22} color="#8B5CF6" />
          <span>Evidence</span>
          <h3>{files.length}</h3>
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
            <b>6.2 GB</b>
          </div>
        </div>

        <div className="monitor-card">
          <HardDrive size={20} />
          <div>
            <p>Storage</p>
            <b>246 GB</b>
          </div>
        </div>
      </div>

      <h3 className="section-title">Mission Dashboard</h3>
            <input
        ref={fileRef}
        type="file"
        hidden
        accept=".wav,.iq"
        onChange={uploadFile}
      />

      <button
        className="upload-btn"
        disabled={loading}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={18} />
        {loading ? "Analyzing RF Signal..." : "Upload RF File"}
      </button>

      {error && (
        <div
          className="extract-success"
          style={{ background: "#7F1D1D", color: "#fff" }}
        >
          {error}
        </div>
      )}

      {analysis && (
        <>
          {/* ================= RF REPORT ================= */}

          <div className="intel-panel">
            <h3>RF Intelligence Report</h3>

            <div className="intel-grid">
              <div>
                <span>Signal Strength</span>
                <h4>{analysis.signal_strength}%</h4>
              </div>

              <div>
                <span>Center Frequency</span>
                <h4>{analysis.center_frequency}</h4>
              </div>

              <div>
                <span>Bandwidth</span>
                <h4>{analysis.bandwidth}</h4>
              </div>

              <div>
                <span>Security Score</span>
                <h4>{analysis.security_score}/100</h4>
              </div>

              <div>
                <span>Threat Level</span>
                <h4>{analysis.threat}</h4>
              </div>
            </div>
            <div className="gauge-grid">
  <div className="gauge-card">
    <span>SNR</span>
    <h2>{analysis.snr} dB</h2>
  </div>

  <div className="gauge-card">
    <span>Noise Floor</span>
    <h2>{analysis.noise_floor}</h2>
  </div>

  <div className="gauge-card">
    <span>Dynamic Range</span>
    <h2>{analysis.dynamic_range} dB</h2>
  </div>

  <div className="gauge-card">
    <span>RMS Power</span>
    <h2>{analysis.rms_power}</h2>
  </div>
</div>
</div>
<div className="dashboard-row">

  <div className="threat-wrap">
    <div className="threat-title">AI Threat Confidence</div>

    <ThreatGauge score={analysis?.security_score ?? 0} />

    <div className="gauge-score">
      {analysis?.security_score ?? 0}/100
    </div>

    <div className={`gauge-label ${(analysis?.threat || "LOW").toLowerCase()}`}>
      {analysis?.threat}
    </div>
  </div>

  <div className="mission-card">
    <h2>MISSION STATUS</h2>

    <div className="mission-row">
      <span>RF Status</span>
      <span className="online">ONLINE</span>
    </div>

    <div className="mission-row">
      <span>Signal</span>
      <span>{analysis?.signal_strength}%</span>
    </div>

    <div className="mission-row">
      <span>Threat</span>
      <span className={analysis?.threat?.toLowerCase()}>
        {analysis?.threat}
      </span>
    </div>

    <div className="mission-row">
      <span>Security</span>
      <span>{analysis?.security_score}/100</span>
    </div>
  </div>

</div>
          {/* ================= RF IMAGES ================= */}

         <div className="rf-images">
  {["fft","spectrogram","waterfall","waveform"].map((key)=>(
    analysis?.[key] && (
      <div className="rf-card" key={key}>
        <img
          src={analysis[key]}
          alt={key}
          loading="lazy"
          onError={(e)=>{
            e.currentTarget.src="/placeholder.png";
          }}
        />
        <p>{key.toUpperCase()}</p>
      </div>
    )
  ))}
</div>

        </>
      )}
            {/* ================= FILE HISTORY ================= */}

      <h3 className="section-title">Evidence Vault</h3>

      <div className="archive-list">
        {files.length === 0 ? (
          <div className="archive-card">
            <div className="archive-info">
              <FileArchive size={18} color="#64748B" />
              <div>
                <h4>No RF Evidence</h4>
                <span>Upload .wav or .iq file</span>
              </div>
            </div>
          </div>
        ) : (
          files.map((file, index) => (
            <div className="archive-card" key={index}>
              <div className="archive-info">
                <FileArchive size={18} color="#8B5CF6" />
                <div>
                  <h4>{file.name}</h4>
                  <span>{file.size}</span>
                </div>
              </div>

              <div className="done-chip">
                <CheckCircle2 size={16} />
                Analyzed
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= TERMINAL ================= */}

      <div className="secure-terminal">
        <div className="terminal-title">
          <Terminal size={16} />
          Secure Terminal
        </div>

        <div className="terminal-body">
          <p>$ vos_rf_engine --boot</p>
          <p>$ initializing RF Intelligence Engine...</p>
          <p>$ evidence vault mounted</p>
          <p>$ signal parser ready</p>

          {loading && (
            <p style={{ color: "#FACC15" }}>
              ● Processing RF signal...
            </p>
          )}

          {done && (
            <p className="success">
              ✓ Analysis completed successfully.
            </p>
          )}
        </div>
      </div>

      {/* ================= SUCCESS ================= */}

      {done && (
        <div className="extract-success">
          <CheckCircle2 size={18} />
          RF Evidence stored successfully in Local SQLite Vault.
        </div>
      )}
    </div>
  );
}