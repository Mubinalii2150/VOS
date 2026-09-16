import { useState } from "react";

export default function Window({
  title,
  children,
  onClose,
  onMinimize,
}) {
  const [max, setMax] = useState(false);
  const [pos, setPos] = useState({ x: 180, y: 70 });
  const [drag, setDrag] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const down = (e) => {
    if (max) return;
    setDrag(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const move = (e) => {
    if (!drag || max) return;
    setPos({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  return (
    <div
      className="window-overlay"
      onMouseMove={move}
      onMouseUp={() => setDrag(false)}
    >
      <div
        className={`window ${max ? "max" : ""}`}
        style={!max ? { left: pos.x, top: pos.y } : {}}
      >
        <div className="titlebar" onMouseDown={down}>
          <div className="title-left">
            <img src="/phoenix.svg" width="18" />
            {title}
          </div>

          <div className="controls">
            <button onClick={onMinimize}>—</button>
            <button onClick={() => setMax(!max)}>□</button>
            <button className="close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="window-body">{children}</div>
      </div>
    </div>
  );
}