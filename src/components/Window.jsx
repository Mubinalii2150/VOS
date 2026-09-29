import { useEffect, useState } from "react";
import { Minus, Square, X } from "lucide-react";

export default function Window({
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex = 30,
  x = 180,
  y = 90,
  width = 800,
  height = 500,
  snapRect = null,
  onMove,
  onMaximize,
}) {
 
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [maximized, setMaximized] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (snapRect) {
      setPosition({
        x: snapRect.x,
        y: snapRect.y,
      });

      setSize({
        width: snapRect.width,
        height: snapRect.height,
      });

      setMaximized(false);
      return;
    }

    if (!maximized) {
      setPosition({ x, y });
      setSize({ width, height });
    }
  }, [
    x,
    y,
    width,
    height,
    snapRect,
    maximized,
  ]);

  /* ================================
     MAXIMIZE
  ================================= */

  const maximize = () => {
    const nextPosition = {
      x: 0,
      y: 0,
    };

    const nextSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    setPosition(nextPosition);
    setSize(nextSize);
    setMaximized(true);

    onMaximize?.({
      action: "maximize",
      maximized: true,
      snap: false,
      position: nextPosition,
      size: nextSize,
    });
  };

  /* ================================
     RESTORE
  ================================= */

  const restore = () => {
    setMaximized(false);

    onMaximize?.({
      action: "restore",
      maximized: false,
      snap: false,
    });
  };

  /* ================================
     HOVER → SNAP LAYOUT
  ================================= */

  const showSnapLayout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect =
      e.currentTarget.getBoundingClientRect();

    window.dispatchEvent(
      new CustomEvent("vos:open-snap-layout", {
        detail: {
          anchor: {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          },
        },
      })
    );
  };

  /* ================================
     REMOVE CURSOR → CLOSE SNAP
  ================================= */

  const hideSnapLayout = (e) => {
    e.stopPropagation();

    window.dispatchEvent(
      new CustomEvent("vos:close-snap-layout")
    );
  };

  /* ================================
     DRAG
  ================================= */

  const handleHeaderMouseDown = (e) => {
    if (e.button !== 0) return;
    if (maximized) return;

    onFocus?.();

    setDragging(true);

    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const nextPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };

      setPosition(nextPosition);

      onMove?.(nextPosition);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, [
    dragging,
    dragOffset,
    onMove,
  ]);

  /* ================================
     MINIMIZE
  ================================= */

  const handleMinimize = (e) => {
    e.preventDefault();
    e.stopPropagation();

    window.dispatchEvent(
      new CustomEvent("vos:close-snap-layout")
    );

    onMinimize?.();
  };

  /* ================================
     CLOSE
  ================================= */

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();

    window.dispatchEvent(
      new CustomEvent("vos:close-snap-layout")
    );

    onClose?.();
  };

  const windowStyle = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    zIndex,
    boxSizing: "border-box",
  };

  return (
    <div
      className={`window ${
        maximized ? "maximized" : ""
      }`}
      style={windowStyle}
      onMouseDown={() => onFocus?.()}
    >
      <div
        className="window-header"
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="window-title">
          {title}
        </div>

        <div className="window-actions">

          {/* MINIMIZE */}

          <button
            type="button"
 
 
            className="win-btn"
 
            title="Minimize"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
            onClick={handleMinimize}
          >
            <Minus size={16} />
          </button>

          {/* MAXIMIZE */}

          <button
            type="button"
            className="win-btn"
            title={
              maximized
                ? "Restore"
                : "Maximize"
            }
            onMouseDown={(e) =>
              e.stopPropagation()
            }
            onMouseEnter={showSnapLayout}
            onMouseLeave={(e) => {
              e.stopPropagation();
            
              // Immediately close mat karo.
              // User ko Snap Layout tak cursor le jaane ka time do.
              window.dispatchEvent(
                new CustomEvent("vos:schedule-close-snap-layout")
              );
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              window.dispatchEvent(
                new CustomEvent(
                  "vos:close-snap-layout"
                )
              );

              if (maximized) {
                restore();
              } else {
                maximize();
              }
            }}
          >
            <Square size={15} />
          </button>

          {/* CLOSE */}

          <button
            type="button"
 
            className="win-btn close"
 
            title="Close"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
            onClick={handleClose}
          >
            <X size={16} />
          </button>

        </div>
      </div>

      <div className="window-body">
        {children}
      </div>
    </div>
  );
}
