"use client";

import { useEffect, useState } from "react";
import styles from "./SectionNav.module.css";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export function SectionNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className={styles.sectionNav} aria-label="Page sections">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={`${styles.link} ${active === s.id ? styles.active : ""}`}>
          {s.label}
        </a>
      ))}

      <button type="button" className={styles.blog} disabled title="Coming soon">
        Blog
      </button>
    </nav>
  );
}
