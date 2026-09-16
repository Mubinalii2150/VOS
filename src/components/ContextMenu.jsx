export default function ContextMenu({ x, y, close }) {
  const items = [
    "New Folder",
    "Paste",
    "Refresh",
    "Personalize",
    "Display Settings",
  ];

  return (
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onMouseLeave={close}
    >
      {items.map((item) => (
        <div className="context-item" key={item}>
          {item}
        </div>
      ))}
    </div>
  );
}