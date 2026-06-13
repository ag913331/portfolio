"use client";

import { HOST, USER } from "@/content/constants";
import { useTerminalController } from "@/features/terminal/useTerminalController";
import { createTerminalRenderers } from "@/features/terminal/renderers";
import { Prompt } from "@/features/prompt/Prompt";
import { TerminalView } from "@/features/terminal/TerminalView";
import { MatrixOverlay } from "@/features/terminal/MatrixOverlay";

import styles from "./Terminal.module.css";

export function Terminal({ onClose, onMinimize }: { onClose?: () => void; onMinimize?: () => void }) {
  const c = useTerminalController({ onClose, onMinimize });

  const { renderOutputEntry } = createTerminalRenderers(styles, {
    onShowPrivateProject: c.showPrivateProject,
    onShowNdaDetails: () => c.showPrivateProject("Private project (NDA)"),
  });

  return (
    <TerminalView
      controller={c}
      PromptComponent={Prompt}
      renderOutputEntry={renderOutputEntry}
      chromeTitle={`${USER}@${HOST}:~`}
      hint={
        <>
          Try: <code>whoami</code>, <code>projects</code>, <code>skills</code>, <code>life</code> — or <code>help</code>
          . Use <code>↑</code>/<code>↓</code> for history. Use <code>Ctrl+L</code> to clear the screen.
        </>
      }
      renderOverlay={(cc) => (cc.matrixOpen ? <MatrixOverlay onClose={cc.closeMatrix} /> : null)}
    />
  );
}
