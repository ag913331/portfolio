"use client";

import { useEffect, useRef } from "react";

import terminalStyles from "@/features/terminal/Terminal.module.css";
import { useBootSequence } from "@/features/boot/useBootSequence";
import { TerminalChrome } from "@/features/terminal/TerminalChrome";
import { Button } from "@/components/Button/Button";
import { HOST } from "@/content/constants";
import styles from "@/features/boot/BootWindow.module.css";

export function BootWindow({ onDone }: { onDone: () => void }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { lines } = useBootSequence({ onDone });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines.length]);

  return (
    <div className={terminalStyles.wrap}>
      <TerminalChrome
        ariaLabel="Preparing environment"
        title={`bootstrap@${HOST}:~`}
        dotsAriaHidden
        dots={
          <>
            <Button variant="unstyled" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotRed}`}>×</span>
            </Button>
            <Button variant="unstyled" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotYellow}`}>−</span>
            </Button>
            <Button variant="unstyled" className={terminalStyles.dotButton} disabled tabIndex={-1}>
              <span className={`${terminalStyles.dot} ${terminalStyles.dotGreen}`}>+</span>
            </Button>
          </>
        }
      >
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
      </TerminalChrome>
    </div>
  );
}
