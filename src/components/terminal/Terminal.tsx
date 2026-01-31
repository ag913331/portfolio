"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Terminal.module.css";
import { AVAILABLE_COMMANDS, TERMINAL_COMMANDS } from "./commands";

type Entry =
  | { kind: "output"; id: string; text: string; muted?: boolean }
  | { kind: "input"; id: string; command: string };

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
  const bootDate = useMemo(() => new Date(), []);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  function runCommand(raw: string) {
    const command = raw.trim();
    if (!command) return;

    setEntries((prev) => [...prev, { kind: "input", id: makeId(), command }]);
    setHistory((prev) => (prev[prev.length - 1] === command ? prev : [...prev, command]));
    setHistoryIdx(null);

    if (command === "clear") {
      setEntries([{ kind: "output", id: makeId(), text: "" }]);
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
                if (!e.muted && e.text.startsWith("Status:")) {
                  const value = e.text.slice("Status:".length).trim();
                  return (
                    <span key={e.id} className={styles.line}>
                      <span>Status:&nbsp;</span>
                      <span className={styles.statusValue}>{value}</span>
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
              if (!isBooting) onSubmit();
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
                disabled={isBooting}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (isBooting) return;

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


