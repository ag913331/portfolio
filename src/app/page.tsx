"use client";

import { useState } from "react";
import Link from "next/link";
import { BootWindow } from "@/features/boot/BootWindow";
import { Button } from "@/components/Button/Button";
import { Desktop } from "@/features/desktop/Desktop";
import { useWindowManager } from "@/features/desktop/useWindowManager";
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
          <section className={styles.landing} aria-label="Welcome">
            <div className={styles.landingInner}>
              <p className={styles.kicker}>Hello, my name is Alexandro.</p>
              <h1 className={styles.title}>Welcome to my terminal portfolio.</h1>
              <p className={styles.subtitle}>
                Explore my work and experience through a Linux-style command line interface.
              </p>

              <div className={styles.actions}>
                <Button variant="solid" className={styles.openBtn} onClick={wm.spawnTerminal}>
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
