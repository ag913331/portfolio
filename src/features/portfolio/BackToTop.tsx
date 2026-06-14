"use client";

import { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

/** A fixed bottom-right button that appears after scrolling and returns to the top. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={`${styles.btn} ${show ? styles.show : ""}`}
      onClick={toTop}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
