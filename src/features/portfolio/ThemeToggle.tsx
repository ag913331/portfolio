"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_THEME, THEME_NAMES, THEMES } from "@/content/themes";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

const swatch = (name: string) => `rgb(${THEMES[name]?.["--accent"] ?? THEMES[DEFAULT_THEME]["--accent"]})`;

export function ThemeToggle() {
  const [current, setCurrent] = useState(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Read the persisted theme on the client; localStorage isn't available during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (name: string) => {
    applyTheme(name);
    setCurrent(name);
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch theme"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.swatch} style={{ background: swatch(current) }} aria-hidden="true" />
        <span className={styles.label}>Theme</span>
      </button>

      {open ? (
        <ul className={styles.menu} role="listbox" aria-label="Theme">
          {THEME_NAMES.map((name) => (
            <li key={name}>
              <button
                type="button"
                role="option"
                aria-selected={name === current}
                className={`${styles.option} ${name === current ? styles.active : ""}`}
                onClick={() => pick(name)}
              >
                <span className={styles.swatch} style={{ background: swatch(name) }} aria-hidden="true" />
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
