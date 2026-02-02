"use client";

import { LIFE_PROMPT_LINE, TERMS_TEXT } from "@/app/utils/constants";
import { useTerminalController } from "@/app/features/terminal/hooks";
import { createTerminalRenderers } from "@/app/features/terminal/renderers";
import { Prompt } from "@/app/features/prompt/Prompt";
import { Button } from "@/app/components/Button/Button";

import styles from "./Terminal.module.css";

export function Terminal({ onClose }: { onClose?: () => void }) {
  const c = useTerminalController({ onClose });

  const { renderOutputEntry } = createTerminalRenderers(
    styles,
    {
      onTermsClick: c.onTermsClick,
      onShowPrivateProject: c.showPrivateProject,
      onShowNdaDetails: () => c.showPrivateProject("Private project (NDA)"),
      getDegreeClass: (idx) => (idx === 1 ? styles.degree1 : idx === 2 ? styles.degree2 : styles.degree3),
    },
    LIFE_PROMPT_LINE,
  );

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
              onClick={() => {
                c.closeTerminal?.();
              }}
            >
              <span className={`${styles.dot} ${styles.dotRed}`} />
            </Button>

            <Button
              variant="unstyled"
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
              className={styles.dotButton}
              aria-label="Maximize"
              title="Maximize"
              disabled={c.isMaximized}
              onClick={() => c.setIsMaximized(true)}
            >
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </Button>
          </div>
          <div className={styles.title}>alexandro@localhost:~</div>
        </div>

        <div className={`${styles.screen} ${c.isMaximized ? styles.screenMax : ""}`}>
          <div className={styles.output} aria-live="polite">
            {c.entries.map((e) => {
              if (e.kind === "output") return renderOutputEntry(e);
              return (
                <span key={e.id} className={styles.line}>
                  <Prompt />
                  {e.command}
                </span>
              );
            })}

            {c.isBooting ? (
              <span className={styles.line}>
                <Prompt />
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
            <Prompt />
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

          <div className={styles.hint}>
            Try: <code>whoami</code>, <code>projects</code>, <code>skills</code>, <code>life</code> — or{" "}
            <code>help</code>. Use <code>↑</code>/<code>↓</code> for history.
          </div>
        </div>

        {c.lifeFlow.mode === "show_terms" ? (
          <div className={styles.overlayBackdrop} role="dialog" aria-modal="true">
            <div className={styles.vimWindow}>
              <div className={styles.vimHeader}>
                vim — terms-and-conditions
              </div>

              <div className={styles.vimBody}>
                <pre className={styles.vimText}>{TERMS_TEXT.join("\n")}</pre>
              </div>

              <form
                className={styles.vimFooter}
                onSubmit={(ev) => {
                  ev.preventDefault();
                  c.onVimSubmit();
                }}
              >
                <span className={styles.vimPrompt} aria-hidden="true">
                  :
                </span>
                <input
                  ref={c.vimInputRef}
                  className={styles.vimInput}
                  value={c.vimCommand}
                  onChange={(e) => c.setVimCommand(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="q to quit"
                />
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
