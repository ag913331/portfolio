"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Terminal.module.css";
import { AVAILABLE_COMMANDS, TERMINAL_COMMANDS } from "./commands";

type Entry =
  | { kind: "output"; id: string; text: string; muted?: boolean }
  | { kind: "input"; id: string; command: string };

type LifeFlowState =
  | { mode: "idle" }
  | { mode: "awaiting_consent"; termsViewed: boolean }
  | { mode: "show_terms" };

function toHref(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@") && !trimmed.includes("://") && !trimmed.startsWith("www.")) {
    return `mailto:${trimmed}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("www.")) return `https://${trimmed}`;
  return null;
}

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
          <span aria-hidden="true" className={styles.terminalLinkSymbol}>🔗</span>
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
  // Matches lines like: '  "institution": "Some School",'
  // Captures prefix up to opening quote of the value, the value itself, and suffix (closing quote + comma/etc).
  const m = text.match(/^(\s*"(institution|degree)"\s*:\s*")([^"]*)(".*)$/);
  if (!m) return null;

  const key = (m[2] ?? "") as "institution" | "degree";
  const prefix = m[1] ?? "";
  const value = m[3] ?? "";
  const suffix = m[4] ?? "";
  return { key, prefix, value, suffix };
}

function formatLastLogin(d: Date) {
  // Example: Sat Jan 31 09:41:02
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("month")} ${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function Terminal({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const bootDate = useMemo(() => new Date(), []);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const vimInputRef = useRef<HTMLInputElement | null>(null);

  const [entries, setEntries] = useState<Entry[]>(() => [
    { kind: "output", id: makeId(), text: `Last login: ${formatLastLogin(bootDate)} on ttys001`, muted: true },
    { kind: "output", id: makeId(), text: "" },
  ]);

  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootTyped, setBootTyped] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [lifeFlow, setLifeFlow] = useState<LifeFlowState>({ mode: "idle" });
  const [vimCommand, setVimCommand] = useState("");

  const suggestion = useMemo(() => {
    const q = value.trim();
    if (!q) return null;

    const match = AVAILABLE_COMMANDS.find((c) => c.startsWith(q));
    if (!match || match === q) return null;
    return match;
  }, [value]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length]);

  useEffect(() => {
    if (lifeFlow.mode === "show_terms") {
      window.setTimeout(() => vimInputRef.current?.focus(), 0);
    }
  }, [lifeFlow.mode]);

  useEffect(() => {
    // Animate the initial "system --init" as if typed, then print the boot output.
    const bootCommand = "system --init";
    const tickMs = 75;

    let i = 0;
    let cancelled = false;

    setIsBooting(true);
    setBootTyped("");

    const t = window.setInterval(() => {
      if (cancelled) return;
      i += 1;
      setBootTyped(bootCommand.slice(0, i));

      if (i >= bootCommand.length) {
        window.clearInterval(t);
        if (cancelled) return;

        setEntries((prev) => [
          ...prev,
          { kind: "input", id: makeId(), command: bootCommand },
          ...TERMINAL_COMMANDS[bootCommand].lines.map((text) => ({
            kind: "output" as const,
            id: makeId(),
            text,
          })),
          { kind: "output", id: makeId(), text: "" },
        ]);

        setHistory([bootCommand]);
        setIsBooting(false);
        setBootTyped("");
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, tickMs);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  function focusInput() {
    inputRef.current?.focus();
  }

  function pushOutput(lines: string[], muted?: boolean) {
    setEntries((prev) => [
      ...prev,
      ...lines.map((text) => ({ kind: "output" as const, id: makeId(), text, muted })),
    ]);
  }

  const LIFE_PROMPT_LINE =
    "You are about to see some amazing pictures of me. Please accept terms and conditions first.";

  const TERMS_TEXT: string[] = [
    "TERMS AND CONDITIONS — LIFE MODE",
    "",
    "By continuing, you agree to the following:",
    "",
    "1) The content shown under the 'life' section may include personal photos and information.",
    "2) These pictures may NOT be downloaded, redistributed, or used in any form without explicit permission.",
    "3) No scraping, mirroring, or automated collection of the content is allowed.",
    "",
    "If you'd like to share anything, please ask first. Thanks :)",
    "",
    "Press :q to quit.",
  ];

  const privateProjectDescriptions: Record<string, string[]> = {
    "Insurance Product Modeling Platform": [
      " ",
      "Insurance Product Modeling Platform (private / NDA)",
      "",
      "This project focused on developing a robust application designed to facilitate the creation of core insurance models and subsequent insurance products.",
      "It encompassed multiple components, including an API, a dashboard for product creation, and a customer-facing website for accessing the final products.",
      "",
      "★ Duration: ~12 months",
      "★ Collaborators (teams): Dev, Management, Marketing, Sales",
      "★ Responsibilities:",
      "  (1) Led development of a comprehensive dashboard enabling departments to create/manage core insurance models and products via the API.",
      "  (2) Collaborated on API development to ensure seamless integration and functionality.",
      "  (3) Ensured the dashboard supported efficient product creation and listing on the customer-facing website.",
      "★ Impact:",
      "  Positioned us among the top companies selling insurance products in the country by streamlining product creation and expanding offerings to meet customer needs.",
      "",
      "Note: Source code and deeper implementation details are private due to NDA.",
    ],
    "Automated Server OS Upgrade": [
      " ",
      "Automated Server OS Upgrade (private / NDA)",
      "",
      "This project automated the deployment and upgrade process of Ubuntu servers end-to-end.",
      "The solution included building an unattended installation image, connecting servers to IPMI, and scripting the full upgrade workflow.",
      "",
      "★ Duration: ~4 months",
      "★ Collaborators (teams): Tech, Data, Algo, DevOps, Traders",
      "★ Responsibilities:",
      "  (1) Coordinated with stakeholders to ensure upgrades didn't disrupt ongoing operations.",
      "  (2) Communicated with teams/management to gather requirements, address concerns, and schedule implementation.",
      "  (3) Bridged technical and non-technical teams to streamline the process and reduce disruption risk.",
      "  (4) Built an autoinstall Ubuntu image for unattended installations.",
      "  (5) Implemented a script to automate backups, image insertion via Redfish API, installation monitoring, system checks, network restore, and package setup.",
      "★ Impact:",
      "  Reduced manual effort/time, ensured consistent installs, minimized downtime, and improved overall system efficiency.",
      "",
      "Note: Source code and deeper implementation details are private due to NDA.",
    ],
    "Private project (NDA)": [
      "Private project (NDA)",
      "",
      "I’ve worked on additional large projects that are under non-disclosure agreements.",
      "I can discuss high-level responsibilities and outcomes in private, but cannot disclose code or sensitive details here.",
    ],
  };

  function showPrivateProject(title: string) {
    const lines = privateProjectDescriptions[title];
    if (!lines) return;
    pushOutput(["", ...lines]);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function runCommand(raw: string) {
    const command = raw.trim();
    if (!command) {
      if (lifeFlow.mode === "awaiting_consent") {
        // Default for Y/n is "Yes", but only after terms were viewed.
        if (!lifeFlow.termsViewed) {
          pushOutput(["Please view the terms and conditions first (click the link), then answer Y/n."], true);
          return;
        }
        pushOutput(["Opening /life ..."], true);
        setLifeFlow({ mode: "idle" });
        router.push("/life");
      }
      return;
    }

    setEntries((prev) => [...prev, { kind: "input", id: makeId(), command }]);
    setHistory((prev) => (prev[prev.length - 1] === command ? prev : [...prev, command]));
    setHistoryIdx(null);

    if (lifeFlow.mode === "awaiting_consent") {
      const normalized = command.toLowerCase();
      const isYes = normalized === "y" || normalized === "yes";
      const isNo = normalized === "n" || normalized === "no";

      if (!isYes && !isNo) {
        pushOutput(["Please answer with Y or n."], true);
        return;
      }

      if (isNo) {
        pushOutput(["Aborted."], true);
        setLifeFlow({ mode: "idle" });
        return;
      }

      if (!lifeFlow.termsViewed) {
        pushOutput(["Please view the terms and conditions first (click the link), then answer Y/n."], true);
        return;
      }

      pushOutput(["Opening /life ..."], true);
      setLifeFlow({ mode: "idle" });
      router.push("/life");
      return;
    }

    if (command === "exit") {
      onClose?.();
      return;
    }

    if (command === "clear") {
      setEntries([{ kind: "output", id: makeId(), text: "" }]);
      return;
    }

    if (command === "download") {
      pushOutput(["Downloading cv.pdf ..."], true);
      const a = document.createElement("a");
      a.href = "/cv.pdf";
      a.download = "cv.pdf";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    if (command === "life") {
      pushOutput([LIFE_PROMPT_LINE, ""], true);
      setLifeFlow({ mode: "awaiting_consent", termsViewed: false });
      return;
    }

    if (command === "help") {
      pushOutput(TERMINAL_COMMANDS.help.lines);
      return;
    }

    const exact = TERMINAL_COMMANDS[command];
    if (exact) {
      pushOutput(exact.lines);
      return;
    }

    pushOutput([`Command not found: ${command}`, "Type 'help' to list available commands."], true);
  }

  function onSubmit() {
    const cmd = value;
    setValue("");
    runCommand(cmd);
  }

  let degreeIdx = 0;

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
            <button
              type="button"
              className={styles.dotButton}
              aria-label="Close terminal"
              title="Close terminal"
              onClick={() => {
                onClose?.();
              }}
            >
              <span className={`${styles.dot} ${styles.dotRed}`} />
            </button>

            <button
              type="button"
              className={styles.dotButton}
              aria-label="Restore size"
              title="Restore size"
              disabled={!isMaximized}
              onClick={() => setIsMaximized(false)}
            >
              <span className={`${styles.dot} ${styles.dotYellow}`} />
            </button>

            <button
              type="button"
              className={styles.dotButton}
              aria-label="Maximize"
              title="Maximize"
              disabled={isMaximized}
              onClick={() => setIsMaximized(true)}
            >
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </button>
          </div>
          <div className={styles.title}>alexandro@localhost:~</div>
        </div>

        <div className={`${styles.screen} ${isMaximized ? styles.screenMax : ""}`}>
          <div className={styles.output} aria-live="polite">
            {entries.map((e) => {
              if (e.kind === "output") {
                if (e.text === LIFE_PROMPT_LINE) {
                  const needle = "terms and conditions";
                  const idx = e.text.indexOf(needle);
                  const before = idx >= 0 ? e.text.slice(0, idx) : e.text;
                  const after = idx >= 0 ? e.text.slice(idx + needle.length) : "";
                  return (
                    <span key={e.id} className={`${styles.line} ${e.muted ? styles.muted : ""}`}>
                      {before}
                      {idx >= 0 ? (
                        <button
                          type="button"
                          className={styles.terminalActionButton}
                          onClick={() => {
                            setLifeFlow({ mode: "show_terms" });
                          }}
                        >
                          {needle}
                        </button>
                      ) : null}
                      {after}
                    </span>
                  );
                }

                if (!e.muted && e.text.startsWith("Status:")) {
                  const value = e.text.slice("Status:".length).trim();
                  return (
                    <span key={e.id} className={styles.line}>
                      <span>Status:&nbsp;</span>
                      <span className={styles.statusValue}>{value}</span>
                    </span>
                  );
                }

                const privateProjectMatch = e.text.match(/^\s*-\s*(.+?)\s+—\s+Show project description\s*$/i);
                if (!e.muted && privateProjectMatch) {
                  const title = (privateProjectMatch[1] ?? "").trim();
                  return (
                    <span key={e.id} className={styles.line}>
                      {"  - "}
                      {title}
                      {" — "}
                      <button
                        type="button"
                        className={styles.terminalActionButton}
                        onClick={() => showPrivateProject(title)}
                      >
                        Show project description
                      </button>
                    </span>
                  );
                }

                const ndaDetailsMatch = e.text.match(/^Private \(NDA\):\s*Details\s*$/i);
                if (!e.muted && ndaDetailsMatch) {
                  return (
                    <span key={e.id} className={styles.line}>
                      {"Private (NDA): "}
                      <button
                        type="button"
                        className={styles.terminalActionButton}
                        onClick={() => showPrivateProject("Private project (NDA)")}
                      >
                        Details
                      </button>
                    </span>
                  );
                }

                const parsed = parseQuotedJsonValueLine(e.text);
                if (!e.muted && parsed) {
                  if (parsed.key === "degree") degreeIdx += 1;
                  const degreeClass =
                    parsed.key === "degree"
                      ? degreeIdx === 1
                        ? styles.degree1
                        : degreeIdx === 2
                          ? styles.degree2
                          : degreeIdx === 3
                            ? styles.degree3
                            : ""
                      : "";

                  const valueClass =
                    parsed.key === "institution" ? styles.institutionValue : degreeClass || undefined;

                  return (
                    <span key={e.id} className={`${styles.line} ${e.muted ? styles.muted : ""}`}>
                      {parsed.prefix}
                      <span className={valueClass}>{parsed.value}</span>
                      {parsed.suffix}
                    </span>
                  );
                }

                return (
                  <span key={e.id} className={`${styles.line} ${e.muted ? styles.muted : ""}`}>
                    {renderOutputLine(e.text, styles.terminalLink)}
                  </span>
                );
              }

              return (
                <span key={e.id} className={styles.line}>
                  <Prompt />
                  {e.command}
                </span>
              );
            })}
            {isBooting ? (
              <span className={styles.line}>
                <Prompt />
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
              if (!isBooting && lifeFlow.mode !== "show_terms") onSubmit();
            }}
          >
            <label className={styles.srOnly} htmlFor="terminal-input">
              Terminal input
            </label>
            <Prompt />
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
                disabled={isBooting || lifeFlow.mode === "show_terms"}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (isBooting || lifeFlow.mode === "show_terms") return;

                  if (e.key === "Tab") {
                    if (suggestion) {
                      e.preventDefault();
                      setValue(suggestion);
                    }
                    return;
                  }

                  if (e.key === "Enter") return;

                  if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
                    e.preventDefault();
                    setValue("");
                    runCommand("clear");
                    return;
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHistoryIdx((prev) => {
                      const next = prev === null ? history.length - 1 : Math.max(0, prev - 1);
                      setValue(history[next] ?? "");
                      return next;
                    });
                    return;
                  }

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHistoryIdx((prev) => {
                      if (prev === null) return null;
                      const next = prev + 1;
                      if (next >= history.length) {
                        setValue("");
                        return null;
                      }
                      setValue(history[next] ?? "");
                      return next;
                    });
                  }
                }}
              />
            </div>
          </form>

          <div className={styles.hint}>
            Try: <code>whoami</code>, <code>projects</code>, <code>skills</code>, <code>life</code> — or{" "}
            <code>help</code>. Use <code>↑</code>/<code>↓</code> for history.
          </div>
        </div>

        {lifeFlow.mode === "show_terms" ? (
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
                  const cmd = vimCommand.trim();
                  if (cmd === ":q") {
                    setVimCommand("");
                    setLifeFlow({ mode: "awaiting_consent", termsViewed: true });
                    pushOutput(["Terms closed. Continue? Y/n"], true);
                    window.setTimeout(() => inputRef.current?.focus(), 0);
                  }
                }}
              >
                <span className={styles.vimPrompt} aria-hidden="true">
                  :
                </span>
                <input
                  ref={vimInputRef}
                  className={styles.vimInput}
                  value={vimCommand}
                  onChange={(e) => setVimCommand(e.target.value)}
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

function Prompt() {
  return (
    <span className={styles.prompt} aria-hidden="true">
      <span className={styles.promptUser}>alexandro</span>
      <span className={styles.promptAt}>@</span>
      <span className={styles.promptHost}>localhost</span>
      <span className={styles.promptColon}>:</span>
      <span className={styles.promptPath}>~</span>
      <span className={styles.promptSymbol}>$</span>
      <span>&nbsp;</span>
    </span>
  );
}

export { AVAILABLE_COMMANDS };


