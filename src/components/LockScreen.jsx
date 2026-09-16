import { useEffect, useState } from "react";

export default function LockScreen({ unlock }) {
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
    <div className="lockscreen" onClick={unlock}>
      <img src="/wallpaper.jpg" className="lock-wall" alt="" />

      <div className="lock-overlay">
        <img src="/phoenix.svg" className="lock-logo" alt="" />

        <h1>{time}</h1>

        <h2>Mubin</h2>

        <p>Click anywhere to unlock</p>
      </div>
    </div>
  );
}