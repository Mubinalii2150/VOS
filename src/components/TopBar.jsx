import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Plane,
  Bell,
} from "lucide-react";

export default function TopBar({
  volume,
  setVolume,
  wifi,
  setWifi,
  airplane,
  setAirplane,
}) {
  const [popup, setPopup] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topbar" onClick={() => setPopup("")}>
      {/* LEFT */}
      <div className="top-left">
        <img src="/phoenix.svg" alt="VOS" className="top-logo" />
        <h2>VOS</h2>
      </div>

      {/* RIGHT */}
      <div className="top-right">

        {/* Volume */}
        <div className="top-item">
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setPopup(popup === "vol" ? "" : "vol");
            }}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {popup === "vol" && (
            <div
              className="top-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Volume</h4>

              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />

              <p>{volume}%</p>
            </div>
          )}
        </div>

        {/* WiFi */}
        <div className="top-item">
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setPopup(popup === "wifi" ? "" : "wifi");
            }}
          >
            {airplane ? (
              <Plane size={18} />
            ) : wifi ? (
              <Wifi size={18} />
            ) : (
              <WifiOff size={18} />
            )}
          </button>

          {popup === "wifi" && (
            <div
              className="top-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Network</h4>

              <div className="net-row">
                <span>Wi-Fi</span>

                <button
                  className={`mini-toggle ${wifi ? "on" : "off"}`}
                  onClick={() => {
                    setWifi(!wifi);
                    if (airplane) setAirplane(false);
                  }}
                >
                  {wifi ? "ON" : "OFF"}
                </button>
              </div>

              <div className="net-row">
                <span>Airplane</span>

                <button
                  className={`mini-toggle ${airplane ? "on" : "off"}`}
                  onClick={() => {
                    const next = !airplane;
                    setAirplane(next);
                    if (next) setWifi(false);
                  }}
                >
                  {airplane ? "ON" : "OFF"}
                </button>
              </div>
            </div>

          )}
        </div>
          {/* Notifications */}
<div className="top-item">
  <button
    className="icon-btn"
    onClick={(e) => {
      e.stopPropagation();
      setPopup(popup === "notify" ? "" : "notify");
    }}
  >
    <Bell size={18} />
  </button>

  {popup === "notify" && (
    <div
      className="top-popup notification-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <h4>Notifications</h4>

      <div className="notify-card">
        <span className="notify-title">RF Engine</span>
        <p>System initialized successfully</p>
        <small>Just now</small>
      </div>

      <div className="notify-card">
        <span className="notify-title">Security</span>
        <p>No active threats detected</p>
        <small>2 min ago</small>
      </div>

      <div className="notify-card">
        <span className="notify-title">VOS</span>
        <p>Welcome to VOS Desktop</p>
        <small>Today</small>
      </div>
    </div>
  )}
</div>
      </div>
    </div>
  );
}