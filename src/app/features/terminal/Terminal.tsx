"use client";

import { LIFE_PROMPT_LINE, TERMS_TEXT } from "@/app/utils/constants";
import { useTerminalController } from "@/app/features/terminal/hooks";
import { createTerminalRenderers } from "@/app/features/terminal/renderers";
import { Prompt } from "@/app/features/prompt/Prompt";
import { TerminalView } from "@/app/features/terminal/TerminalView";

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
    <TerminalView
      controller={c}
      PromptComponent={Prompt}
      renderOutputEntry={renderOutputEntry}
      chromeTitle="alexandro@localhost:~"
      hint={
        <>
          Try: <code>whoami</code>, <code>projects</code>, <code>skills</code>, <code>life</code> — or{" "}
          <code>help</code>. Use <code>↑</code>/<code>↓</code> for history.
        </>
      }
      renderOverlay={(cc) =>
        cc.lifeFlow.mode === "show_terms" ? (
          <div className={styles.overlayBackdrop} role="dialog" aria-modal="true">
            <div className={styles.vimWindow}>
              <div className={styles.vimHeader}>vim — terms-and-conditions</div>

              <div className={styles.vimBody}>
                <pre className={styles.vimText}>{TERMS_TEXT.join("\n")}</pre>
              </div>

              <form
                className={styles.vimFooter}
                onSubmit={(ev) => {
                  ev.preventDefault();
                  cc.onVimSubmit();
                }}
              >
                <span className={styles.vimPrompt} aria-hidden="true">
                  :
                </span>
                <input
                  ref={cc.vimInputRef}
                  className={styles.vimInput}
                  value={cc.vimCommand}
                  onChange={(e) => cc.setVimCommand(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="q to quit"
                />
              </form>
            </div>
          </div>
        ) : null
      }
    />
  );
}
