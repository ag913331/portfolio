"use client";

import { useEffect, useRef, useState } from "react";
import { CERTIFICATIONS, EXPERIENCE, PUBLIC_PROJECTS, SKILLS } from "@/content/resume";
import styles from "./Stats.module.css";

const FIRST_ROLE_YEAR = 2018;

type StatItem = { value: number; suffix: string; label: string };

function Stat({ value, suffix, label, run }: StatItem & { run: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setN(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const duration = 1000;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);

  return (
    <div className={styles.stat}>
      <span className={styles.num}>
        {n}
        {suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export function Stats() {
  const items: StatItem[] = [
    { value: Math.max(1, new Date().getFullYear() - FIRST_ROLE_YEAR), suffix: "+", label: "Years experience" },
    { value: SKILLS.reduce((n, g) => n + g.items.length, 0), suffix: "+", label: "Technologies" },
    { value: EXPERIENCE.length, suffix: "", label: "Roles" },
    { value: PUBLIC_PROJECTS.length + CERTIFICATIONS.length, suffix: "", label: "Projects & certs" },
  ];

  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.stats}>
      {items.map((it) => (
        <Stat key={it.label} {...it} run={run} />
      ))}
    </div>
  );
}
