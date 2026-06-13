"use client";

import type { ReactNode } from "react";

const TONE_TO_STYLE: Record<EmTone, string> = {
  status: "statusValue",
  period: "experiencePeriod",
  periodCurrent: "experiencePeriodCurrent",
  institution: "institutionValue",
  degree1: "degree1",
  degree2: "degree2",
  degree3: "degree3",
  dir: "institutionValue",
};

export function createTerminalRenderers(styles: CSSModuleClasses, callbacks: RendererCallbacks) {
  function renderInline(part: Inline, key: number): ReactNode {
    if (typeof part === "string") return part;

    if (part.kind === "link") {
      return (
        <a
          key={key}
          className={styles.terminalLink}
          href={part.href}
          target={part.external ? "_blank" : undefined}
          rel={part.external ? "noopener noreferrer" : undefined}
        >
          {part.label}
        </a>
      );
    }

    if (part.kind === "action") {
      const onClick =
        part.action === "terms"
          ? callbacks.onTermsClick
          : part.action === "nda"
            ? callbacks.onShowNdaDetails
            : () => callbacks.onShowPrivateProject(part.arg ?? "");
      return (
        <button key={key} type="button" className={styles.terminalActionButton} onClick={onClick}>
          {part.label}
        </button>
      );
    }

    return (
      <span key={key} className={styles[TONE_TO_STYLE[part.tone]]}>
        {part.text}
      </span>
    );
  }

  function renderOutputEntry(e: Extract<Entry, { kind: "output" }>) {
    const { node } = e;
    const blockClass =
      node.block === "section" ? styles.sectionHeader : node.block === "position" ? styles.experiencePosition : "";

    return (
      <span key={e.id} className={`${styles.line} ${node.muted ? styles.muted : ""} ${blockClass}`}>
        {node.parts.map((p, i) => renderInline(p, i))}
      </span>
    );
  }

  return { renderOutputEntry };
}
