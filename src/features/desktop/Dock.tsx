"use client";

import type { TerminalWindow } from "./useWindowManager";
import styles from "./Desktop.module.css";

export function Dock({
  windows,
  focusedId,
  canSpawn,
  onSpawn,
  onSelect,
}: {
  windows: TerminalWindow[];
  focusedId: string | null;
  canSpawn: boolean;
  onSpawn: () => void;
  onSelect: (w: TerminalWindow) => void;
}) {
  return (
    <div className={styles.dock}>
      {windows.map((w, i) => (
        <button
          key={w.id}
          type="button"
          className={`${styles.dockItem} ${w.minimized ? styles.dockItemMin : ""} ${
            w.id === focusedId ? styles.dockItemActive : ""
          }`}
          onClick={() => onSelect(w)}
          title={w.minimized ? "Restore terminal" : "Focus terminal"}
        >
          <span className={styles.dockDot} />
          term {i + 1}
        </button>
      ))}

      <button
        type="button"
        className={styles.dockSpawn}
        onClick={onSpawn}
        disabled={!canSpawn}
        aria-label="New terminal"
        title="New terminal"
      >
        +
      </button>
    </div>
  );
}
