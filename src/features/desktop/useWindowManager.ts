"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { makeId } from "@/lib/helpers";
import { MAX_TERMINALS } from "@/content/constants";

export type TerminalWindow = {
  id: string;
  dx: number;
  dy: number;
  z: number;
};

export type WindowManager = ReturnType<typeof useWindowManager>;

/**
 * Owns the floating terminal windows: spawning, z-order, drag offsets, and the
 * "too many terminals" guard. The Ctrl+T spawn shortcut is only bound while
 * `enabled` is true (i.e. after boot).
 */
export function useWindowManager({ enabled }: { enabled: boolean }) {
  const [windows, setWindows] = useState<TerminalWindow[]>([]);
  const [tooManyModalOpen, setTooManyModalOpen] = useState(false);
  const lastSpawnAtRef = useRef(0);

  const canSpawn = windows.length < MAX_TERMINALS;

  const spawnTerminal = useCallback(() => {
    setWindows((prev) => {
      if (prev.length >= MAX_TERMINALS) return prev;

      const maxZ = prev.reduce((m, w) => Math.max(m, w.z), 0);
      const i = prev.length;
      const step = 50;
      const maxOffset = 72;
      const dx = Math.min(i * step, maxOffset);
      const dy = Math.min(i * step, maxOffset);

      const next: TerminalWindow = { id: makeId(), dx, dy, z: maxZ + 1 };
      return [...prev, next];
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = prev.reduce((m, w) => Math.max(m, w.z), 0);
      return prev.map((w) => (w.id === id ? { ...w, z: maxZ + 1 } : w));
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const replaceOldest = useCallback(() => {
    setTooManyModalOpen(false);
    setWindows((prev) => (prev.length ? prev.slice(1) : prev));
    window.setTimeout(() => spawnTerminal(), 0);
  }, [spawnTerminal]);

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      bringToFront(String(e.active.id));
    },
    [bringToFront],
  );

  const onDragEnd = useCallback((e: DragEndEvent) => {
    const id = String(e.active.id);
    const { x, y } = e.delta;

    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, dx: w.dx + x, dy: w.dy + y } : w)));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      const isCtrlT = e.ctrlKey && (e.key === "t" || e.key === "T");
      if (!isCtrlT) return;

      e.preventDefault();
      if (tooManyModalOpen) return;

      const now = Date.now();
      if (now - lastSpawnAtRef.current < 250) return;
      lastSpawnAtRef.current = now;

      if (windows.length >= MAX_TERMINALS) {
        setTooManyModalOpen(true);
        return;
      }

      spawnTerminal();
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Escape") setTooManyModalOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled, spawnTerminal, tooManyModalOpen, windows.length]);

  return {
    windows,
    canSpawn,
    spawnTerminal,
    bringToFront,
    closeWindow,
    replaceOldest,
    onDragStart,
    onDragEnd,
    tooManyModalOpen,
    setTooManyModalOpen,
  };
}
