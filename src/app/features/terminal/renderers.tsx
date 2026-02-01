"use client";

import { toHref } from "@/app/utils/helpers";

export function createTerminalRenderers(
  styles: CSSModuleClasses,
  callbacks: RendererCallbacks,
  lifePromptLine: string,
) {
  let degreeIdx = 0;

  function renderOutputLine(text: string, linkClassName: string) {
    if (text.trimStart().startsWith("★")) {
      return <span className={styles.sectionHeader}>{text}</span>;
    }

    if (text.startsWith("o-------->")) {
      return <span className={styles.experiencePosition}>{text}</span>;
    }

    const periodMatch = text.match(/^(\|\s*period:\s*)(.+)$/);
    if (periodMatch) {
      const prefix = periodMatch[1] ?? "";
      const value = (periodMatch[2] ?? "").trim();
      const isCurrent = value === "Nov 2024 - Current";
      return (
        <>
          {prefix}
          <span className={isCurrent ? styles.experiencePeriodCurrent : styles.experiencePeriod}>{value}</span>
        </>
      );
    }

    const credentialMatch = text.match(/^(\s*(?:\|\s*)?credential:\s*)(.+)$/i);
    if (credentialMatch) {
      const prefix = credentialMatch[1] ?? "";
      const value = (credentialMatch[2] ?? "").trim();
      const href = toHref(value);
      if (href && !href.startsWith("mailto:")) {
        return (
          <>
            {prefix}
            <span aria-hidden="true" className={styles.terminalLinkSymbol}>
              🔗
            </span>
            <a className={linkClassName} href={href} target="_blank" rel="noopener noreferrer">
              Show credential
            </a>
          </>
        );
      }
    }

    // Handles lines like: "  - GitHub: https://..." or "  - Email: foo@bar.com"
    const m = text.match(/^(\s*-\s*[^:]+:\s*)(.+)$/);
    if (m) {
      const prefix = m[1] ?? "";
      const value = (m[2] ?? "").trim();
      const href = toHref(value);

      if (href) {
        const isMail = href.startsWith("mailto:");
        return (
          <>
            {prefix}
            <a
              className={linkClassName}
              href={href}
              target={isMail ? undefined : "_blank"}
              rel={isMail ? undefined : "noopener noreferrer"}
            >
              {value}
            </a>
          </>
        );
      }
    }

    // Fallback: if the entire line is a URL.
    const href = toHref(text);
    if (href) {
      const isMail = href.startsWith("mailto:");
      return (
        <a
          className={linkClassName}
          href={href}
          target={isMail ? undefined : "_blank"}
          rel={isMail ? undefined : "noopener noreferrer"}
        >
          {text}
        </a>
      );
    }

    return text;
  }

  function parseQuotedJsonValueLine(text: string) {
    const m = text.match(/^(\s*"(institution|degree)"\s*:\s*")([^"]*)(".*)$/);
    if (!m) return null;

    const key = (m[2] ?? "") as "institution" | "degree";
    const prefix = m[1] ?? "";
    const value = m[3] ?? "";
    const suffix = m[4] ?? "";
    return { key, prefix, value, suffix };
  }

  function renderOutputEntry(e: Entry) {
    // This renderer is only intended for output entries.
    const out = e as Extract<Entry, { kind: "output" }>;

    if (out.text === lifePromptLine) {
      const needle = "terms and conditions";
      const idx = out.text.indexOf(needle);
      const before = idx >= 0 ? out.text.slice(0, idx) : out.text;
      const after = idx >= 0 ? out.text.slice(idx + needle.length) : "";
      return (
        <span key={out.id} className={`${styles.line} ${out.muted ? styles.muted : ""}`}>
          {before}
          {idx >= 0 ? (
            <button type="button" className={styles.terminalActionButton} onClick={callbacks.onTermsClick}>
              {needle}
            </button>
          ) : null}
          {after}
        </span>
      );
    }

    if (!out.muted && out.text.startsWith("Status:")) {
      const value = out.text.slice("Status:".length).trim();
      return (
        <span key={out.id} className={styles.line}>
          <span>Status:&nbsp;</span>
          <span className={styles.statusValue}>{value}</span>
        </span>
      );
    }

    const privateProjectMatch = out.text.match(/^\s*-\s*(.+?)\s+—\s+Show project description\s*$/i);
    if (!out.muted && privateProjectMatch) {
      const title = (privateProjectMatch[1] ?? "").trim();
      return (
        <span key={out.id} className={styles.line}>
          {"  - "}
          {title}
          {" — "}
          <button
            type="button"
            className={styles.terminalActionButton}
            onClick={() => callbacks.onShowPrivateProject(title)}
          >
            Show project description
          </button>
        </span>
      );
    }

    const ndaDetailsMatch = out.text.match(/^Private \(NDA\):\s*Details\s*$/i);
    if (!out.muted && ndaDetailsMatch) {
      return (
        <span key={out.id} className={styles.line}>
          {"Private (NDA): "}
          <button type="button" className={styles.terminalActionButton} onClick={callbacks.onShowNdaDetails}>
            Details
          </button>
        </span>
      );
    }

    const parsed = parseQuotedJsonValueLine(out.text);
    if (!out.muted && parsed) {
      if (parsed.key === "degree") degreeIdx += 1;
      const degreeClass = parsed.key === "degree" ? callbacks.getDegreeClass(degreeIdx) : "";
      const valueClass = parsed.key === "institution" ? styles.institutionValue : degreeClass || undefined;

      return (
        <span key={out.id} className={`${styles.line} ${out.muted ? styles.muted : ""}`}>
          {parsed.prefix}
          <span className={valueClass}>{parsed.value}</span>
          {parsed.suffix}
        </span>
      );
    }

    return (
      <span key={out.id} className={`${styles.line} ${out.muted ? styles.muted : ""}`}>
        {renderOutputLine(out.text, styles.terminalLink)}
      </span>
    );
  }

  return { renderOutputEntry };
}


