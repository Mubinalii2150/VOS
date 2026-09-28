import { useEffect, useState } from "react";
import { Minus, Square, X } from "lucide-react";

export default function Window({
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  onMaximize,
  onMove,
  zIndex,
  x = 180,
  y = 90,
  width = 800,
  height = 500,
}) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [maximized, setMaximized] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (dragging) return;
    setPosition({ x, y });
    setSize({ width, height });
  }, [x, y, width, height, dragging]);

  const handleDown = (e) => {
    if (e.button !== 0 || maximized) return;

    onFocus?.();
    setDragging(true);

    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging || maximized) return;

      const maxX = Math.max(0, window.innerWidth - size.width);
      const maxY = Math.max(
        58,
        window.innerHeight - size.height - 58
      );

      const nextPosition = {
        x: Math.min(
          maxX,
          Math.max(0, e.clientX - offset.x)
        ),
        y: Math.min(
          maxY,
          Math.max(58, e.clientY - offset.y)
        ),
      };

      setPosition(nextPosition);
      onMove?.(nextPosition);
    };

    const up = () => setDragging(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [
    dragging,
    maximized,
    offset,
    size.width,
    size.height,
    onMove,
  ]);

  const handleMaximize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();

    if (onMaximize) {
      onMaximize();
      return;
    }

    setMaximized((value) => !value);
  };

  const style = maximized
    ? {
        left: 0,
        top: 58,
        width: "100vw",
        height: "calc(100vh - 116px)",
      }
    : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      };

  return (
    <div
      className={"window" + (maximized ? " maximized" : "")}
      style={{ ...style, zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className="window-header"
        onMouseDown={handleDown}
      >
        <div className="window-title">
          <img
            src="/phoenix.svg"
            className="window-logo"
            alt="phoenix"
          />
          <span>{title}</span>
        </div>

        <div
          className="window-actions"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="win-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMinimize?.();
            }}
            title="Minimize"
          >
            <Minus size={15} />
          </button>

          <button
            type="button"
            className="win-btn"
            onClick={handleMaximize}
            title="Snap Layout"
          >
            <Square size={13} />
          </button>

          <button
            type="button"
            className="win-btn close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="window-body">{children}</div>
    </div>
  );
}
