"use client";

import type { ComponentType, ReactNode } from "react";

import styles from "./Terminal.module.css";
import { Button } from "@/app/components/Button/Button";

export type TerminalViewBaseController = {
  entries: Entry[];

  value: string;
  setValue: (next: string) => void;
  suggestion: string | null;

  isBooting: boolean;
  bootTyped: string;

  isMaximized: boolean;
  setIsMaximized: (next: boolean) => void;

  isOverlayOpen: boolean;

  inputRef: React.RefObject<HTMLInputElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;

  focusInput: () => void;
  onSubmit: () => void;
  onTerminalKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  closeTerminal?: () => void;
};

export type TerminalViewProps<C extends TerminalViewBaseController = TerminalViewBaseController> = {
  controller: C;
  PromptComponent: ComponentType;
  renderOutputEntry: (e: Extract<Entry, { kind: "output" }>) => ReactNode;

  chromeTitle?: string;
  hint?: ReactNode;
  renderOverlay?: (c: C) => ReactNode;
};

export function TerminalView<C extends TerminalViewBaseController>({
  controller: c,
  PromptComponent,
  renderOutputEntry,
  chromeTitle = "localhost:~",
  hint,
  renderOverlay,
}: TerminalViewProps<C>) {
  return (
    <div className={`${styles.wrap} ${c.isMaximized ? styles.wrapMax : ""}`} onMouseDown={c.focusInput}>
      <div
        className={`${styles.window} ${c.isMaximized ? styles.windowMax : ""}`}
        role="application"
        aria-label="Portfolio terminal"
      >
        <div className={styles.glow} />
        <div className={styles.scanlines} />

        <div className={styles.chrome}>
          <div className={styles.dots}>
            <Button
              variant="unstyled"
              className={styles.dotButton}
              aria-label="Close terminal"
              title="Close terminal"
              onClick={() => c.closeTerminal?.()}
            >
              <span className={`${styles.dot} ${styles.dotRed}`} />
            </Button>

            <Button
              variant="unstyled"
              type="button"
              className={styles.dotButton}
              aria-label="Restore size"
              title="Restore size"
              disabled={!c.isMaximized}
              onClick={() => c.setIsMaximized(false)}
            >
              <span className={`${styles.dot} ${styles.dotYellow}`} />
            </Button>

            <Button
              variant="unstyled"
              type="button"
              className={styles.dotButton}
              aria-label="Maximize"
              title="Maximize"
              disabled={c.isMaximized}
              onClick={() => c.setIsMaximized(true)}
            >
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </Button>
          </div>

          <div className={styles.title}>{chromeTitle}</div>
        </div>

        <div className={`${styles.screen} ${c.isMaximized ? styles.screenMax : ""}`}>
          <div className={styles.output} aria-live="polite">
            {c.entries.map((e) => {
              if (e.kind === "output") return renderOutputEntry(e);
              return (
                <span key={e.id} className={styles.line}>
                  <PromptComponent />
                  {e.command}
                </span>
              );
            })}

            {c.isBooting ? (
              <span className={styles.line}>
                <PromptComponent />
                {c.bootTyped}
                <span aria-hidden="true">▍</span>
              </span>
            ) : null}
            <div ref={c.bottomRef} />
          </div>

          <form
            className={styles.promptRow}
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!c.isBooting && !c.isOverlayOpen) c.onSubmit();
            }}
          >
            <label className={styles.srOnly} htmlFor="terminal-input">
              Terminal input
            </label>
            <PromptComponent />
            <div className={styles.inputWrap}>
              <div className={styles.ghost} aria-hidden="true">
                {c.suggestion ? (
                  <>
                    <span className={styles.ghostTyped}>{c.value}</span>
                    <span className={styles.ghostRemainder}>{c.suggestion.slice(c.value.trim().length)}</span>
                  </>
                ) : (
                  <span className={styles.ghostTyped}>{c.value}</span>
                )}
              </div>
              <input
                id="terminal-input"
                ref={c.inputRef}
                className={styles.input}
                value={c.value}
                disabled={c.isBooting || c.isOverlayOpen}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => c.setValue(e.target.value)}
                onKeyDown={c.onTerminalKeyDown}
              />
            </div>
          </form>

          {hint ? <div className={styles.hint}>{hint}</div> : null}
        </div>

        {renderOverlay ? renderOverlay(c) : null}
      </div>
    </div>
  );
}


