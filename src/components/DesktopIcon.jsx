import React from "react";

export default function DesktopIcon({
  icon: Icon,
  name,
  onOpen,
  onMenu,
}) {
  const handleClick = (event) => {
    event.stopPropagation();
    onOpen?.();
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onMenu?.(event);
  };

  return (
    <div
      className="desktop-icon"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="icon-box">
        <Icon size={34} strokeWidth={1.8} />
      </div>

      <span>{name}</span>
    </div>
  );
}