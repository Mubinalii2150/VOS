import { useEffect } from "react";

export default function BootScreen({ finish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      finish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="boot-screen">
      <img
        src="/phoenix.svg"
        className="boot-logo"
        alt="Phoenix"
      />

      <h1>VOS</h1>

      <p>Rise • Build • Innovate</p>

      <div className="loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}