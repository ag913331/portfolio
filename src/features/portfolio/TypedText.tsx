"use client";

import { useEffect, useState } from "react";
import styles from "./TypedText.module.css";

/** Types `text` out one character at a time with a blinking terminal cursor. */
export function TypedText({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      return;
    }
    let i = 0;
    let id = window.setTimeout(function tick() {
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) id = window.setTimeout(tick, 55);
    }, 350);
    return () => window.clearTimeout(id);
  }, [text]);

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
      <span className={styles.cursor} aria-hidden="true" />
    </p>
  );
}
