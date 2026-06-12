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
  controller,
  PromptComponent,
  renderOutputEntry,
  chromeTitle = "localhost:~",
  hint,
  renderOverlay,
}: TerminalViewProps<C>) {
  const {
    entries,
    value,
    setValue,
    suggestion,
    isBooting,
    bootTyped,
    isMaximized,
    setIsMaximized,
    isOverlayOpen,
    inputRef,
    bottomRef,
    focusInput,
    onSubmit,
    onTerminalKeyDown,
    closeTerminal,
  } = controller;

  return (
    <div className={`${styles.wrap} ${isMaximized ? styles.wrapMax : ""}`} onMouseDown={focusInput}>
      <div
        className={`${styles.window} ${isMaximized ? styles.windowMax : ""}`}
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
              onClick={() => closeTerminal?.()}
            >
              <span className={`${styles.dot} ${styles.dotRed}`} />
            </Button>

            <Button
              variant="unstyled"
              type="button"
              className={styles.dotButton}
              aria-label="Restore size"
              title="Restore size"
              disabled={!isMaximized}
              onClick={() => setIsMaximized(false)}
            >
              <span className={`${styles.dot} ${styles.dotYellow}`} />
            </Button>

            <Button
              variant="unstyled"
              type="button"
              className={styles.dotButton}
              aria-label="Maximize"
              title="Maximize"
              disabled={isMaximized}
              onClick={() => setIsMaximized(true)}
            >
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </Button>
          </div>

          <div className={styles.title}>{chromeTitle}</div>
        </div>

        <div className={`${styles.screen} ${isMaximized ? styles.screenMax : ""}`}>
          <div className={styles.output} aria-live="polite">
            {entries.map((e) => {
              if (e.kind === "output") return renderOutputEntry(e);
              return (
                <span key={e.id} className={styles.line}>
                  <PromptComponent />
                  {e.command}
                </span>
              );
            })}

            {isBooting ? (
              <span className={styles.line}>
                <PromptComponent />
                {bootTyped}
                <span aria-hidden="true">▍</span>
              </span>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form
            className={styles.promptRow}
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!isBooting && !isOverlayOpen) onSubmit();
            }}
          >
            <label className={styles.srOnly} htmlFor="terminal-input">
              Terminal input
            </label>
            <PromptComponent />
            <div className={styles.inputWrap}>
              <div className={styles.ghost} aria-hidden="true">
                {suggestion ? (
                  <>
                    <span className={styles.ghostTyped}>{value}</span>
                    <span className={styles.ghostRemainder}>{suggestion.slice(value.trim().length)}</span>
                  </>
                ) : (
                  <span className={styles.ghostTyped}>{value}</span>
                )}
              </div>
              <input
                id="terminal-input"
                ref={inputRef}
                className={styles.input}
                value={value}
                disabled={isBooting || isOverlayOpen}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onTerminalKeyDown}
              />
            </div>
          </form>

          {hint ? <div className={styles.hint}>{hint}</div> : null}
        </div>

        {renderOverlay ? renderOverlay(controller) : null}
      </div>
    </div>
  );
}


