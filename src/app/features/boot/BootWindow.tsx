"use client";

import { useEffect, useRef } from "react";

import terminalStyles from "@/app/features/terminal/Terminal.module.css";
import { useBootSequence } from "@/app/features/boot/useBootSequence";
import { Button } from "@/app/components/Button/Button";
import styles from "@/app/features/boot/BootWindow.module.css";

export function BootWindow({ onDone }: { onDone: () => void }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { lines } = useBootSequence({ onDone });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines.length]);

  return (
    <div className={terminalStyles.wrap}>
      <div className={terminalStyles.window} role="application" aria-label="Preparing environment">
        <div className={terminalStyles.glow} />
        <div className={terminalStyles.scanlines} />

        <div className={terminalStyles.chrome}>
          <div className={terminalStyles.dots} aria-hidden="true">
            <Button variant="unstyled" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotRed}`}>×</span>
            </Button>
            <Button variant="unstyled" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotYellow}`}>−</span>
            </Button>
            <Button variant="unstyled" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotGreen}`}>+</span>
            </Button>
          </div>
          <div className={terminalStyles.title}>bootstrap@localhost:~</div>
        </div>

        <div className={terminalStyles.screen}>
          <div className={terminalStyles.output} aria-live="polite">
            {lines.map((l, idx) => (
              <span
                key={idx}
                className={`${terminalStyles.line} ${l.muted ? terminalStyles.muted : ""} ${idx === 0 ? styles.welcomeLine : ""}`}
              >
                {l.text}
              </span>
            ))}
            <span className={terminalStyles.line} aria-hidden="true">
              ▍
            </span>
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}


