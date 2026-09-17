import { useState, useEffect } from "react";
import {
  Palette,
  Volume2,
  Clock3,
  Wifi,
  Shield,
  User,
} from "lucide-react";

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
  const [saved, setSaved] = useState(false);

  const [time, setTime] = useState(new Date());

  const [security, setSecurity] = useState(() => {
    const data = localStorage.getItem("vos-security");
    return data
      ? JSON.parse(data)
      : {
          airGap: true,
          sqlite: true,
          autoSave: true,
          intercept: false,
        };
  });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const wallpapers = [
    "/wallpaper.jpg",
    "/wall2.jpg",
    "/wall3.jpg",
  ];

  const saveConfiguration = () => {
    localStorage.setItem(
      "vos-security",
      JSON.stringify(security)
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-container">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        <h2>Settings</h2>

        <button onClick={() => setPage("appearance")}>
          <Palette size={18} />
          Display
        </button>

        <button onClick={() => setPage("sound")}>
          <Volume2 size={18} />
          Sound
        </button>

        <button onClick={() => setPage("clock")}>
          <Clock3 size={18} />
          Date & Time
        </button>

        <button onClick={() => setPage("network")}>
          <Wifi size={18} />
          Network
        </button>

        <button onClick={() => setPage("system")}>
          <Shield size={18} />
          System Security
        </button>

        <button onClick={() => setPage("account")}>
          <User size={18} />
          Account
        </button>
      </aside>

      {/* Content */}
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
                  className={`wall ${
                    wallpaper === img ? "active-wall" : ""
                  }`}
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
                <b>Master Volume</b>
                <p>{volume}%</p>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) =>
                  setVolume(Number(e.target.value))
                }
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
                <b>Current Time</b>
                <h1>{time.toLocaleTimeString()}</h1>
              </div>
            </div>

            <div className="setting-card">
              <div>
                <b>Today's Date</b>
                <h3>{time.toDateString()}</h3>
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
                <b>Wi-Fi</b>
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
                <b>Airplane Mode</b>
                <p>{airplane ? "Enabled" : "Disabled"}</p>
              </div>

              <button
                className={`toggle-btn ${
                  airplane ? "on" : "off"
                }`}
                onClick={() => setAirplane(!airplane)}
              >
                {airplane ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-card">
              <div>
                <b>IPv4 Address</b>
                <p>192.168.1.102</p>
              </div>
            </div>
          </>
        )}

        {/* System Security */}
        {page === "system" && (
          <>
            <h2>System & Security Configuration</h2>

            <div className="setting-card">
              <div>
                <b>Air-Gapped Isolation Protocol</b>
                <p>Complete offline secure execution</p>
              </div>

              <button
                className={`toggle-btn ${
                  security.airGap ? "on" : "off"
                }`}
                onClick={() =>
                  setSecurity({
                    ...security,
                    airGap: !security.airGap,
                  })
                }
              >
                {security.airGap ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-card">
              <div>
                <b>SQLite Local Evidence Vault</b>
                <p>Store forensic evidence locally</p>
              </div>

              <button
                className={`toggle-btn ${
                  security.sqlite ? "on" : "off"
                }`}
                onClick={() =>
                  setSecurity({
                    ...security,
                    sqlite: !security.sqlite,
                  })
                }
              >
                {security.sqlite ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-card">
              <div>
                <b>Auto Save</b>
                <p>Automatic secure checkpoints</p>
              </div>

              <button
                className={`toggle-btn ${
                  security.autoSave ? "on" : "off"
                }`}
                onClick={() =>
                  setSecurity({
                    ...security,
                    autoSave: !security.autoSave,
                  })
                }
              >
                {security.autoSave ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-card">
              <div>
                <b>Intercept Analysis</b>
                <p>RF signal anomaly detection</p>
              </div>

              <button
                className={`toggle-btn ${
                  security.intercept ? "on" : "off"
                }`}
                onClick={() =>
                  setSecurity({
                    ...security,
                    intercept: !security.intercept,
                  })
                }
              >
                {security.intercept ? "ON" : "OFF"}
              </button>
            </div>

            <button
              className="save-config-btn"
              onClick={saveConfiguration}
            >
              Save Configuration
            </button>

            {saved && (
              <div className="save-success">
                ✓ Configuration Saved Successfully
              </div>
            )}
          </>
        )}

        {/* Account */}
        {page === "account" && (
          <>
            <h2>Account</h2>

            <div className="profile-box">
              <img
                src="/phoenix.svg"
                alt="VOS"
                className="profile-icon"
              />

              <div>
                <h3>Mubin Ali</h3>
                <p>VOS Administrator</p>
              </div>
            </div>

            <div className="setting-card">
              <div>
                <b>Edition</b>
                <p>VOS Phoenix 1.0</p>
              </div>
            </div>

            <div className="setting-card">
              <div>
                <b>Version</b>
                <p>Build 2026.09</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}