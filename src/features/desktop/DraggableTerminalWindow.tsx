"use client";

import { useDraggable } from "@dnd-kit/core";
import { Terminal } from "@/features/terminal/Terminal";
import type { TerminalWindow } from "./useWindowManager";
import styles from "./Desktop.module.css";

export function DraggableTerminalWindow({
  w,
  bringToFront,
  closeWindow,
}: {
  w: TerminalWindow;
  bringToFront: (id: string) => void;
  closeWindow: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: w.id });

  const x = w.dx + (transform?.x ?? 0);
  const y = w.dy + (transform?.y ?? 0);

  return (
    <div
      ref={setNodeRef}
      className={styles.terminalWindow}
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
        <Terminal onClose={() => closeWindow(w.id)} />
      </div>
    </div>
  );
}
