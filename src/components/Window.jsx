import { useState, useEffect } from "react";
import { Minus, Square, X } from "lucide-react";

export default function Window({
  title,
  children,
  onClose,
  onMinimize,
}) {
  const [maximized, setMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [position, setPosition] = useState({
    x: 180,
    y: 70,
  });

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  });

  const handleDown = (e) => {
    if (maximized) return;

    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging || maximized) return;

      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    };

    const up = () => setDragging(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, offset, maximized]);

  return (
    <div
      className={`window ${maximized ? "maximized" : ""}`}
      style={
        maximized
          ? {}
          : {
              left: position.x,
              top: position.y,
            }
      }
    >
      <div className="window-header" onMouseDown={handleDown}>
        <div className="window-title">
          <img src="/phoenix.svg" className="window-logo" />
          <span>{title}</span>
        </div>

        <div
          className="window-actions"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="win-btn"
            onClick={onMinimize}
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            className="win-btn"
            onClick={() => setMaximized(!maximized)}
          >
            <Square size={14} />
          </button>

          <button
            type="button"
            className="win-btn close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="window-body">{children}</div>
    </div>
  );
}