"use client";

import type { ReactNode } from "react";
import styles from "./Terminal.module.css";

/**
 * The CRT window shell: glow, scanlines, and the title bar with traffic-light dots.
 * Shared by the live terminal and the boot window. Callers supply the `dots`
 * (interactive buttons vs. decorative glyphs) and the screen `children`.
 */
export function TerminalChrome({
  ariaLabel,
  title,
  dots,
  dotsAriaHidden,
  maximized,
  children,
}: {
  ariaLabel: string;
  title: string;
  dots: ReactNode;
  dotsAriaHidden?: boolean;
  maximized?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.window} ${maximized ? styles.windowMax : ""}`} role="application" aria-label={ariaLabel}>
      <div className={styles.glow} />
      <div className={styles.scanlines} />

      <div className={styles.chrome}>
        <div className={styles.dots} aria-hidden={dotsAriaHidden || undefined}>
          {dots}
        </div>
        <div className={styles.title}>{title}</div>
      </div>

      {children}
    </div>
  );
}
