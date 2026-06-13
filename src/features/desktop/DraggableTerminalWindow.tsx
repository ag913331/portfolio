"use client";

import { useDraggable } from "@dnd-kit/core";
import { Terminal } from "@/features/terminal/Terminal";
import type { TerminalWindow } from "./useWindowManager";
import styles from "./Desktop.module.css";

export function DraggableTerminalWindow({
  w,
  focused,
  bringToFront,
  closeWindow,
  minimizeWindow,
}: {
  w: TerminalWindow;
  focused: boolean;
  bringToFront: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: w.id });

  if (w.minimized) return null;

  const x = w.dx + (transform?.x ?? 0);
  const y = w.dy + (transform?.y ?? 0);

  return (
    <div
      ref={setNodeRef}
      className={`${styles.terminalWindow} ${focused ? "" : styles.dimmed}`}
      style={{
        zIndex: w.z,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: isDragging ? "none" : "transform 120ms ease-out",
      }}
      {...attributes}
      {...listeners}
      onClick={() => bringToFront(w.id)}
    >
      <div className={styles.terminalWindowInner}>
        <Terminal onClose={() => closeWindow(w.id)} onMinimize={() => minimizeWindow(w.id)} />
      </div>
    </div>
  );
}
