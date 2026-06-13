"use client";

import { useEffect, useState } from "react";
import { PRIVATE_PROJECTS } from "@/content/resume";
import { PRIVATE_PROJECT_DESCRIPTIONS } from "@/content/constants";
import styles from "./PrivateProjects.module.css";

function teaserFor(title: string): string {
  const lines = PRIVATE_PROJECT_DESCRIPTIONS[title] ?? [];
  return lines.find((l) => l.trim() && !l.includes("(private / NDA)")) ?? "";
}

function DescriptionBody({ title }: { title: string }) {
  const lines = PRIVATE_PROJECT_DESCRIPTIONS[title] ?? [];
  return (
    <div className={styles.readout}>
      {lines.map((line, i) => {
        if (line.includes("(private / NDA)")) return null; // already shown in the header
        if (!line.trim()) return <div key={i} className={styles.gap} aria-hidden="true" />;
        const isStar = line.trimStart().startsWith("★");
        const isNote = line.startsWith("Note:");
        return (
          <div key={i} className={`${styles.row} ${isStar ? styles.star : ""} ${isNote ? styles.note : ""}`}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

export function PrivateProjects() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <>
      <p className={styles.intro}>Selected large-scale work under NDA — open a card for a high-level overview.</p>

      <div className={styles.cards}>
        {PRIVATE_PROJECTS.map((p) => (
          <button key={p.title} type="button" className={styles.card} onClick={() => setActive(p.title)}>
            <span className={styles.badge}>NDA</span>
            <h3 className={styles.title}>{p.title}</h3>
            <p className={styles.teaser}>{teaserFor(p.title)}</p>
            <span className={styles.view}>View details →</span>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-label={active}
          onClick={() => setActive(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>{active}</h3>
              <button type="button" className={styles.close} aria-label="Close" onClick={() => setActive(null)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <DescriptionBody title={active} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
