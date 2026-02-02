"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@/app/features/terminal/Terminal";
import { Button } from "@/app/components/Button/Button";
import Link from "next/link";
import { makeId } from "@/app/utils/helpers";
import { MAX_TERMINALS } from "@/app/utils/constants";
import styles from "./page.module.css";

export default function Home() {
  const [windows, setWindows] = useState<TerminalWindow[]>(() => [
    { id: makeId(), dx: 0, dy: 0 },
  ]);
  const [tooManyModalOpen, setTooManyModalOpen] = useState(false);
  const lastSpawnAtRef = useRef(0);

  const canSpawn = windows.length < MAX_TERMINALS;

  const spawnTerminal = useCallback(() => {
    setWindows((prev) => {
      if (prev.length >= MAX_TERMINALS) return prev;

      const i = prev.length;
      const step = 18;
      const maxOffset = 72;
      const dx = Math.min(i * step, maxOffset);
      const dy = Math.min(i * step, maxOffset);

      const next: TerminalWindow = { id: makeId(), dx, dy };
      return [...prev, next];
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      if (idx === prev.length - 1) return prev;

      const w = prev[idx]!;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1), w];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Ctrl+T is "new tab" in browsers; keep it in-app.
      const isCtrlT = e.ctrlKey && (e.key === "t" || e.key === "T");
      if (!isCtrlT) return;

      e.preventDefault();
      if (tooManyModalOpen) return;

      // Throttle so holding Ctrl+T doesn't spawn an absurd amount instantly.
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
  }, [spawnTerminal, tooManyModalOpen, windows.length]);

  const hasAnyTerminal = windows.length > 0;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {hasAnyTerminal ? (
          <section className={styles.terminalStage} aria-label="Terminal windows">
            {windows.map((w) => (
              <div
                key={w.id}
                className={styles.terminalWindow}
                onMouseDown={() => bringToFront(w.id)}
              >
                <div className={styles.terminalWindowInner} style={{ left: w.dx, top: w.dy }}>
                  <Terminal
                    key={w.id}
                    onClose={() => {
                      closeWindow(w.id);
                    }}
                  />
                </div>
              </div>
            ))}

            {tooManyModalOpen ? (
              <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Too many terminals">
                <div className={styles.modal}>
                  <div className={styles.modalTitle}>Wooha, hold on buddy…</div>
                  <p className={styles.modalText}>
                    What are you going to do with so many terminals? (Max {MAX_TERMINALS}.)
                  </p>
                  <div className={styles.modalActions}>
                    <Button
                      variant="solid"
                      onClick={() => {
                        setTooManyModalOpen(false);
                      }}
                    >
                      OK
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={canSpawn}
                      onClick={() => {
                        // Optional nicety: close the oldest and open a new one.
                        setTooManyModalOpen(false);
                        setWindows((prev) => (prev.length ? prev.slice(1) : prev));
                        window.setTimeout(() => spawnTerminal(), 0);
                      }}
                    >
                      Replace oldest
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : (
          <section className={styles.landing} aria-label="Welcome">
            <div className={styles.landingInner}>
              <p className={styles.kicker}>Hello, my name is Alexandro.</p>
              <h1 className={styles.title}>Welcome to my terminal portfolio.</h1>
              <p className={styles.subtitle}>
                Explore my work and experience through a Linux-style command line interface.
              </p>

              <div className={styles.actions}>
                <Button
                  variant="solid"
                  className={styles.openBtn}
                  onClick={() => {
                    spawnTerminal();
                  }}
                >
                  $: Open terminal
                </Button>

                <Link className={styles.cvBtn} href="/cv.pdf" download>
                  $: Download CV
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
