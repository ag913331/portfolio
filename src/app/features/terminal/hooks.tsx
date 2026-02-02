"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_COMMANDS, TERMINAL_COMMANDS } from "@/app/utils/commands";
import { formatLastLogin, makeId } from "@/app/utils/helpers";
import { LIFE_PROMPT_LINE, PRIVATE_PROJECT_DESCRIPTIONS } from "@/app/utils/constants";

type LifeFlowState =
  | { mode: "idle" }
  | { mode: "awaiting_consent"; termsViewed: boolean }
  | { mode: "show_terms" };

export function useTerminalController({ onClose }: { onClose?: () => void }) {
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
  const [_, setHistoryIdx] = useState<number | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootTyped, setBootTyped] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [lifeFlow, setLifeFlow] = useState<LifeFlowState>({ mode: "idle" });
  const [vimCommand, setVimCommand] = useState("");

  const isOverlayOpen = lifeFlow.mode === "show_terms";

  const suggestion = useMemo(() => {
    const q = value.trim();
    if (!q) return null;
    const match = AVAILABLE_COMMANDS.find((c) => c.startsWith(q));
    if (!match || match === q) return null;
    return match;
  }, [value]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const pushOutput = useCallback((lines: string[], muted?: boolean) => {
    setEntries((prev) => [...prev, ...lines.map((text) => ({ kind: "output" as const, id: makeId(), text, muted }))]);
  }, []);

  const showPrivateProject = useCallback(
    (title: string) => {
      const lines = PRIVATE_PROJECT_DESCRIPTIONS[title];
      if (!lines) return;
      pushOutput(["", ...lines]);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [pushOutput],
  );

  const runCommand = useCallback(
    (raw: string) => {
      const command = raw.trim();

      if (!command) {
        if (lifeFlow.mode === "awaiting_consent") {
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
    },
    [lifeFlow, onClose, pushOutput, router],
  );

  const onSubmit = useCallback(() => {
    const cmd = value;
    setValue("");
    runCommand(cmd);
  }, [runCommand, value]);

  const onTermsClick = useCallback(() => {
    setLifeFlow({ mode: "show_terms" });
  }, []);

  const onVimSubmit = useCallback(() => {
    const cmd = vimCommand.trim();
    if (cmd !== ":q") return;

    setVimCommand("");
    setLifeFlow({ mode: "awaiting_consent", termsViewed: true });
    pushOutput(["Terms closed. Continue? Y/n"], true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [pushOutput, vimCommand]);

  const onTerminalKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isBooting || isOverlayOpen) return;

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
    },
    [history, isBooting, isOverlayOpen, runCommand, suggestion],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length]);

  useEffect(() => {
    if (lifeFlow.mode === "show_terms") window.setTimeout(() => vimInputRef.current?.focus(), 0);
  }, [lifeFlow.mode]);

  useEffect(() => {
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

  return {
    // state
    entries,
    value,
    setValue,
    suggestion,
    isBooting,
    bootTyped,
    isMaximized,
    lifeFlow,
    isOverlayOpen,
    vimCommand,
    setVimCommand,

    // refs
    inputRef,
    bottomRef,
    vimInputRef,

    // handlers
    focusInput,
    onSubmit,
    runCommand,
    onTerminalKeyDown,
    onTermsClick,
    onVimSubmit,
    showPrivateProject,
    setIsMaximized,
    closeTerminal: onClose,
  };
}


