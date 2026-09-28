import React from "react";

const LAYOUTS = [
  {
    id: "two",
    columns: 2,
    rows: 1,
    slots: [
      { id: "slot-0", col: 1, row: 1 },
      { id: "slot-1", col: 2, row: 1 },
    ],
  },
  {
    id: "left-wide",
    columns: 3,
    rows: 1,
    slots: [
      { id: "slot-0", col: 1, row: 1, span: 2 },
      { id: "slot-1", col: 3, row: 1 },
    ],
  },
  {
    id: "right-wide",
    columns: 3,
    rows: 1,
    slots: [
      { id: "slot-0", col: 1, row: 1 },
      { id: "slot-1", col: 2, row: 1, span: 2 },
    ],
  },
  {
    id: "three",
    columns: 3,
    rows: 1,
    slots: [
      { id: "slot-0", col: 1, row: 1 },
      { id: "slot-1", col: 2, row: 1 },
      { id: "slot-2", col: 3, row: 1 },
    ],
  },
  {
    id: "four",
    columns: 2,
    rows: 2,
    slots: [
      { id: "slot-0", col: 1, row: 1 },
      { id: "slot-1", col: 2, row: 1 },
      { id: "slot-2", col: 1, row: 2 },
      { id: "slot-3", col: 2, row: 2 },
    ],
  },
  {
    id: "large-left",
    columns: 3,
    rows: 2,
    slots: [
      { id: "slot-0", col: 1, row: 1, span: 2, rowSpan: 2 },
      { id: "slot-1", col: 3, row: 1 },
      { id: "slot-2", col: 3, row: 2 },
    ],
  },
];

function renderAppIcon(icon) {
  if (!icon) return null;

  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      size: icon.props?.size ?? 26,
      strokeWidth: icon.props?.strokeWidth ?? 1.8,
    });
  }

  if (typeof icon === "object" && icon !== null && icon.$$typeof) {
    return React.createElement(icon, {
      size: 26,
      strokeWidth: 1.8,
    });
  }

  if (typeof icon === "function") {
    return React.createElement(icon, {
      size: 26,
      strokeWidth: 1.8,
    });
  }

  return null;
}

export default function SnapLayoutV2({
  open = false,
  runningApps = [],
  selectedAppId = null,
  onArrange,
  onClose,
}) {
  const [layoutId, setLayoutId] = React.useState("two");
  const [slots, setSlots] = React.useState({});
  const [localSelectedAppId, setLocalSelectedAppId] =
    React.useState(selectedAppId);

  const layout =
    LAYOUTS.find((item) => item.id === layoutId) || LAYOUTS[0];

  const activeAppId = selectedAppId || localSelectedAppId;

  React.useEffect(() => {
    setLocalSelectedAppId(selectedAppId);
  }, [selectedAppId]);

  React.useEffect(() => {
    if (!open) return;

    const next = {};

    runningApps.slice(0, layout.slots.length).forEach((app, index) => {
      next[`slot-${index}`] = app.id;
    });

    setSlots(next);

    if (
      activeAppId &&
      !runningApps.some((app) => app.id === activeAppId)
    ) {
      setLocalSelectedAppId(null);
    }
  }, [open, runningApps, layout.slots.length]);

  if (!open) return null;

  const getApp = (id) => {
    if (!id) return null;
    return runningApps.find((app) => app.id === id) || null;
  };

  const emitArrangement = (nextSlots, nextLayout = layout) => {
    setSlots(nextSlots);
    onArrange?.(nextSlots, nextLayout);
  };

  /*
    IMPORTANT:
    Clicking an occupied slot when no app is selected now SELECTS that app.
    This fixes the "clicking does nothing" behavior.
  */
  const selectOrMoveSlot = (slotId) => {
    const clickedAppId = slots[slotId] || null;

    // Nothing is selected yet:
    // clicking an occupied app selects it.
    if (!activeAppId) {
      if (clickedAppId) {
        setLocalSelectedAppId(clickedAppId);
      }
      return;
    }

    // Clicking the selected app again keeps it selected.
    if (clickedAppId === activeAppId) {
      return;
    }

    const currentSlot = Object.keys(slots).find(
      (key) => slots[key] === activeAppId
    );

    const next = { ...slots };

    // Selected app is not currently assigned to a slot.
    if (!currentSlot) {
      if (clickedAppId) {
        // Swap clicked app into the old conceptual position by
        // simply placing selected app in this slot.
        next[slotId] = activeAppId;
      } else {
        next[slotId] = activeAppId;
      }

      emitArrangement(next, layout);
      return;
    }

    // Occupied target => swap.
    if (clickedAppId) {
      next[currentSlot] = clickedAppId;
      next[slotId] = activeAppId;
    } else {
      // Empty target => move.
      next[currentSlot] = null;
      next[slotId] = activeAppId;
    }

    emitArrangement(next, layout);
    setLocalSelectedAppId(null);
  };

  const clearSlot = (slotId) => {
    const next = {
      ...slots,
      [slotId]: null,
    };

    emitArrangement(next, layout);

    if (activeAppId === slots[slotId]) {
      setLocalSelectedAppId(null);
    }
  };

  const changeLayout = (nextLayout) => {
    setLayoutId(nextLayout.id);

    const currentApps = Object.values(slots).filter(Boolean);
    const next = {};

    nextLayout.slots.forEach((slot, index) => {
      next[slot.id] = currentApps[index] || null;
    });

    emitArrangement(next, nextLayout);
  };

  return (
    <div
      className="vos-snap-v2"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="snap-v2-header">
        <span>Snap Layout</span>

        <button
          type="button"
          className="snap-v2-close"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
        >
          ×
        </button>
      </div>

      <div className="snap-v2-layout-picker">
        {LAYOUTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              layoutId === item.id
                ? "snap-v2-layout active"
                : "snap-v2-layout"
            }
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              changeLayout(item);
            }}
            title={`Use ${item.id} layout`}
          >
            <div
              className="snap-v2-preview"
              style={{
                gridTemplateColumns: `repeat(${item.columns}, 1fr)`,
                gridTemplateRows: `repeat(${item.rows}, 1fr)`,
              }}
            >
              {item.slots.map((slot) => (
                <span
                  key={slot.id}
                  style={{
                    gridColumn: `${slot.col} / span ${slot.span || 1}`,
                    gridRow: `${slot.row} / span ${slot.rowSpan || 1}`,
                  }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div
        className="snap-v2-workspace"
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
        }}
      >
        {layout.slots.map((slot) => {
          const app = getApp(slots[slot.id]);
          const isSelected =
            activeAppId && app?.id === activeAppId;

          return (
            <button
              key={slot.id}
              type="button"
              className={[
                "snap-v2-slot",
                app ? "occupied" : "empty",
                isSelected ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                gridColumn: `${slot.col} / span ${slot.span || 1}`,
                gridRow: `${slot.row} / span ${slot.rowSpan || 1}`,
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectOrMoveSlot(slot.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (app) {
                  clearSlot(slot.id);
                }
              }}
              title={
                app
                  ? `${app.title || app.id} — click to select, then click another slot to move/swap`
                  : "Click to place selected app here"
              }
            >
              {app ? (
                <>
                  <span className="snap-v2-icon">
                    {renderAppIcon(
                      app.icon ??
                        app.Icon ??
                        app.iconComponent
                    )}
                  </span>

                  <span className="snap-v2-app-dot" />
                </>
              ) : (
                <span className="snap-v2-empty">+</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="snap-v2-help">
        {activeAppId
          ? "App selected — choose another slot to move or swap it."
          : "Click a running app to select it, then choose a slot."}
      </div>
    </div>
  );
}

export { LAYOUTS };
