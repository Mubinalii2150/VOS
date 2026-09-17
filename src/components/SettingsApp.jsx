import { useState } from "react";

export default function SettingsApp({
  theme,
  setTheme,
  wallpaper,
  setWallpaper,
  volume,
  setVolume,
  wifi,
  setWifi,
  airplane,
  setAirplane,
}) {
  const [page, setPage] = useState("appearance");

  const [airGap, setAirGap] = useState(true);
const [sqlite, setSqlite] = useState(true);
const [autoSave, setAutoSave] = useState(false);
const [saved, setSaved] = useState(false);

const saveSecurity = () => {
  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
};
  const wallpapers = [
    "/wallpaper.jpg",
    "/wall3.jpg",
    "/wall2.jpg",
  ];

  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <h2>Settings</h2>

        <button onClick={() => setPage("appearance")}> Display</button>
        <button onClick={() => setPage("sound")}>Sound</button>
        <button onClick={() => setPage("clock")}> Date & Time</button>
        <button onClick={() => setPage("network")}> Network & Internet</button>
        <button onClick={() => setPage("security")}>System & Security</button>
        <button onClick={() => setPage("account")}> Account</button>
        
      </div>

      <div className="settings-content">
        {/* Appearance */}
        {page === "appearance" && (
          <>
            <h2>Display</h2>

            <h3>Theme</h3>
            <div className="theme-row">
              <button
                className={theme === "dark" ? "active" : ""}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>

              <button
                className={theme === "light" ? "active" : ""}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
            </div>

            <h3>Wallpaper</h3>
            <div className="wall-grid">
              {wallpapers.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className={`wall ${wallpaper === img ? "active-wall" : ""}`}
                  onClick={() => setWallpaper(img)}
                />
              ))}
            </div>
          </>
        )}

        {/* Sound */}
        {page === "sound" && (
          <>
            <h2>Sound</h2>

            <div className="setting-card">
              <div>
                <h3>Master Volume</h3>
                <p>{volume}%</p>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>
          </>
        )}

        {/* Clock */}
        {page === "clock" && (
          <>
            <h2>Date & Time</h2>

            <div className="setting-card">
              <div>
                <h3>Current Time</h3>
                <h1>{new Date().toLocaleTimeString()}</h1>
              </div>
            </div>

            <div className="setting-card">
              <div>
                <h3>Today's Date</h3>
                <p>{new Date().toDateString()}</p>
              </div>
            </div>
          </>
        )}

        {/* Network */}
        {page === "network" && (
          <>
            <h2>Network & Internet</h2>

            <div className="setting-card">
              <div>
                <h3>Wi-Fi</h3>
                <p>{wifi ? "Connected" : "Disconnected"}</p>
              </div>

              <button
                className={`toggle-btn ${wifi ? "on" : "off"}`}
                onClick={() => setWifi(!wifi)}
              >
                {wifi ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-card">
              <div>
                <h3>Airplane Mode</h3>
                <p>{airplane ? "Enabled" : "Disabled"}</p>
              </div>

              <button
                className={`toggle-btn ${airplane ? "on" : "off"}`}
                onClick={() => setAirplane(!airplane)}
              >
                {airplane ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-card">
              <div>
                <h3>IPv4 Address</h3>
                <p>{wifi ? "192.168.1.102" : "--.--.--.--"}</p>
              </div>
            </div>
          </>
        )}

        {/* Account */}
        {page === "account" && (
          <>
            <h2>Account</h2>

            <div className="profile-box">
              <img
                src="/phoenix.svg"
                alt="Phoenix"
                className="profile-icon"
              />

              <div>
                <h3>mubin</h3>
                <p>VOS Administrator</p>
              </div>
            </div>

            <div className="setting-card">
              <div>
                <h3>Edition</h3>
                <p>VOS  1.0</p>
              </div>
            </div>

            <div className="setting-card">
              <div>
                <h3>Version</h3>
                <p>Build 2026.09</p>
              </div>
            </div>
          </>
        )}
        {page === "security" && (
  <>
    <h2>System & Security Configuration</h2>

    <div className="security-card">
      <div>
        <h3>Air-Gapped Isolation Protocol</h3>
        <p>Disconnects all external network communication.</p>
      </div>

      <button
        className={`toggle-btn ${airGap ? "on" : "off"}`}
        onClick={() => setAirGap(!airGap)}
      >
        {airGap ? "ON" : "OFF"}
      </button>
    </div>

    <div className="security-card">
      <div>
        <h3>SQLite Local Evidence Vault</h3>
        <p>Store forensic evidence only in local encrypted database.</p>
      </div>

      <button
        className={`toggle-btn ${sqlite ? "on" : "off"}`}
        onClick={() => setSqlite(!sqlite)}
      >
        {sqlite ? "ON" : "OFF"}
      </button>
    </div>

    <div className="security-card">
      <div>
        <h3>Auto Save Intercept Analysis</h3>
        <p>Automatically preserve analyzed packets & reports.</p>
      </div>

      <button
        className={`toggle-btn ${autoSave ? "on" : "off"}`}
        onClick={() => setAutoSave(!autoSave)}
      >
        {autoSave ? "ON" : "OFF"}
      </button>
    </div>

    <button className="save-config" onClick={saveSecurity}>
      Save Configuration
    </button>

    {saved && (
      <div className="config-saved">
        ✓ Security configuration saved successfully.
      </div>
    )}
  </>
)}
      </div>
    </div>
  );
}