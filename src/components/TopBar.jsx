import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Plane,
} from "lucide-react";
export default function TopBar({
  volume,
  setVolume,
  wifi,
  airplane,
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
    <div className="topbar">
      <div className="top-left">
        <img src="/phoenix.svg" alt="phoenix" />
        <h3>VOS</h3>
        
      </div>

      <div className="top-right">
        {/* Volume */}
        <div className="top-item">
          <span onClick={() => setPopup(popup === "vol" ? "" : "vol")}>
            {volume === 0 ? <VolumeX size={18}/> : <Volume2 size={18}/>}
          </span>

          {popup === "vol" && (
            <div className="top-popup">
              <h4>Volume</h4>

              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) =>
                  setVolume(Number(e.target.value))
                }
              />

              <p>{volume}%</p>
            </div>
          )}
        </div>

        {/* WiFi */}
        <div className="top-item">
          <span onClick={() => setPopup(popup === "wifi" ? "" : "wifi")}>
  {airplane ? (
    <Plane size={18}/>
  ) : wifi ? (
    <Wifi size={18}/>
  ) : (
    <WifiOff size={18}/>
  )}
</span>

          {popup === "wifi" && (
            <div className="top-popup">
              <h4>Network</h4>

              <div className="net-row">
                <span>Wi-Fi</span>
                <b>{wifi ? "Connected" : "Off"}</b>
              </div>

              <div className="net-row">
                <span>Airplane</span>
                <b>{airplane ? "On" : "Off"}</b>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}