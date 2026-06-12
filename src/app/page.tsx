"use client";

import { useState } from "react";
import { BootWindow } from "@/features/boot/BootWindow";
import { Desktop } from "@/features/desktop/Desktop";
import { useWindowManager } from "@/features/desktop/useWindowManager";
import { Landing } from "@/features/landing/Landing";
import styles from "./page.module.css";

export default function Home() {
  const [hasBooted, setHasBooted] = useState(false);
  const wm = useWindowManager({ enabled: hasBooted });

  const hasAnyTerminal = wm.windows.length > 0;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {!hasBooted ? (
          <section className={styles.terminalStage} aria-label="Preparing environment">
            <BootWindow
              onDone={() => {
                setHasBooted(true);
                window.setTimeout(() => wm.spawnTerminal(), 0);
              }}
            />
          </section>
        ) : hasAnyTerminal ? (
          <section className={styles.terminalStage} aria-label="Terminal windows">
            <Desktop manager={wm} />
          </section>
        ) : (
          <Landing onOpenTerminal={wm.spawnTerminal} />
        )}
      </main>
    </div>
  );
}
