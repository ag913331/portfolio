"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Button } from "@/components/Button/Button";
import { MAX_TERMINALS } from "@/content/constants";
import { DraggableTerminalWindow } from "./DraggableTerminalWindow";
import { Dock } from "./Dock";
import type { TerminalWindow, WindowManager } from "./useWindowManager";
import styles from "./Desktop.module.css";

export function Desktop({ manager }: { manager: WindowManager }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }, // prevents accidental drags on click
    }),
  );

  const onSelect = (w: TerminalWindow) => (w.minimized ? manager.restoreWindow(w.id) : manager.bringToFront(w.id));

  return (
    <div className={styles.desktop}>
      <div className={styles.stage}>
        <DndContext sensors={sensors} onDragStart={manager.onDragStart} onDragEnd={manager.onDragEnd}>
          {manager.windows.map((w) => (
            <DraggableTerminalWindow
              key={w.id}
              w={w}
              focused={w.id === manager.focusedId}
              bringToFront={manager.bringToFront}
              closeWindow={manager.closeWindow}
              minimizeWindow={manager.minimizeWindow}
            />
          ))}
        </DndContext>

        {manager.tooManyModalOpen ? (
          <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Too many terminals">
            <div className={styles.modal}>
              <div className={styles.modalTitle}>Wooha, hold on buddy…</div>
              <p className={styles.modalText}>
                What are you going to do with so many terminals? (Max {MAX_TERMINALS}.)
              </p>
              <div className={styles.modalActions}>
                <Button variant="solid" onClick={() => manager.setTooManyModalOpen(false)}>
                  OK
                </Button>
                <Button variant="ghost" disabled={manager.canSpawn} onClick={manager.replaceOldest}>
                  Replace oldest
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Dock
        windows={manager.windows}
        focusedId={manager.focusedId}
        canSpawn={manager.canSpawn}
        onSpawn={manager.spawnTerminal}
        onSelect={onSelect}
      />
    </div>
  );
}
