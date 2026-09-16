import React from "react";

export default function DesktopIcon({
  icon: Icon,
  name,
  onOpen,
}) {
  return (
    <div className="desktop-icon" onDoubleClick={onOpen}>
      <div className="icon-box">
        <Icon size={34} strokeWidth={1.8} />
      </div>
      <span>{name}</span>
    </div>
  );
}