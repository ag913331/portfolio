"use client";

import { useEffect, useRef } from "react";

import terminalStyles from "@/app/features/terminal/Terminal.module.css";
import { useBootSequence } from "@/app/features/boot/useBootSequence";

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
            <button type="button" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotRed}`}>×</span>
            </button>
            <button type="button" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotYellow}`}>−</span>
            </button>
            <button type="button" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotGreen}`}>+</span>
            </button>
          </div>
          <div className={terminalStyles.title}>bootstrap@localhost:~</div>
        </div>

        <div className={terminalStyles.screen}>
          <div className={terminalStyles.output} aria-live="polite">
            {lines.map((l, idx) => (
              <span key={idx} className={`${terminalStyles.line} ${l.muted ? terminalStyles.muted : ""}`}>
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


