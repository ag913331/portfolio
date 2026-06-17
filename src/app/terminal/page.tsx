"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BootWindow } from "@/features/boot/BootWindow";
import { Desktop } from "@/features/desktop/Desktop";
import { useWindowManager } from "@/features/desktop/useWindowManager";
import { Landing } from "@/features/landing/Landing";
import styles from "./page.module.css";

// Boot animation plays once per browser session, then refreshes skip straight to the terminal.
const BOOT_FLAG = "portfolio-booted";

const hasBootedThisSession = () => {
  try {
    return sessionStorage.getItem(BOOT_FLAG) === "1";
  } catch {
    return false;
  }
};

export default function Home() {
  const [hasBooted, setHasBooted] = useState(false);
  // Gate rendering until we've checked sessionStorage so we don't flash the boot
  // window on a refresh (the check must run client-side, after hydration).
  const [bootChecked, setBootChecked] = useState(false);
  const wm = useWindowManager({ enabled: hasBooted });

  const hasAnyTerminal = wm.windows.length > 0;

  useEffect(() => {
    if (hasBootedThisSession()) {
      setHasBooted(true);
      wm.spawnTerminal();
    }
    setBootChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBootDone = () => {
    setHasBooted(true);
    try {
      sessionStorage.setItem(BOOT_FLAG, "1");
    } catch {
      // sessionStorage may be unavailable; boot just replays next visit.
    }
    window.setTimeout(() => wm.spawnTerminal(), 0);
  };

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.traditionalLink}>
        Not a fan of terminals? View the traditional layout →
      </Link>

      <main className={styles.main}>
        {!bootChecked ? null : !hasBooted ? (
          <section className={styles.terminalStage} aria-label="Preparing environment">
            <BootWindow onDone={onBootDone} />
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
