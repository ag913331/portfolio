"use client";

import { useEffect, useRef } from "react";
import styles from "./Terminal.module.css";

const GLYPHS = "アイウエオカキクケコ0123456789ABCDEF<>[]{}#$%&*+=".split("");
const FONT_SIZE = 14;

/** Full-screen "digital rain" that fills the terminal window. Any key or click exits. */
export function MatrixOverlay({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    let drops: number[] = [];
    let columns = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      columns = Math.max(1, Math.floor(canvas.width / FONT_SIZE));
      drops = Array.from({ length: columns }, () => Math.floor((Math.random() * -canvas.height) / FONT_SIZE));
    };
    resize();

    const rgb = getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "0, 255, 128";
    let raf = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px var(--mono, monospace)`;

      for (let i = 0; i < columns; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        ctx.fillStyle = `rgba(${rgb}, ${Math.random() > 0.95 ? 1 : 0.85})`;
        ctx.fillText(glyph, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const onKey = () => onClose();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.matrixOverlay} onClick={onClose} role="presentation">
      <canvas ref={canvasRef} className={styles.matrixCanvas} />
      <div className={styles.matrixHint}>press any key to exit</div>
    </div>
  );
}
