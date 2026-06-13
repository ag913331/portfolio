"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_COMMANDS, TERMINAL_COMMANDS } from "@/content/commands";
import { action, blank, em, node, prose, text } from "@/content/format";
import { buildNeofetch } from "@/content/neofetch";
import { completePath, cwdToDisplay, lsNodes, resolve, treeNodes } from "@/content/fs";
import { THEME_NAMES } from "@/content/themes";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { formatLastLogin, makeId } from "@/lib/helpers";
import { HOST, LIFE_PROMPT_LINE, PRIVATE_PROJECT_DESCRIPTIONS, USER } from "@/content/constants";

type LifeFlowState = { mode: "idle" } | { mode: "awaiting_consent"; termsViewed: boolean } | { mode: "show_terms" };

const PATH_COMMANDS = /^(cd|ls|cat|tree)\s+(\S*)$/;

function detectOs(ua: string): string {
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Mac/.test(ua)
        ? "macOS"
        : /Win/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "Web";
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : "Browser";
  return `${browser} on ${os}`;
}

export function useTerminalController({ onClose, onMinimize }: { onClose?: () => void; onMinimize?: () => void }) {
  const router = useRouter();
  const bootDate = useMemo(() => new Date(), []);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const vimInputRef = useRef<HTMLInputElement | null>(null);

  const [entries, setEntries] = useState<Entry[]>(() => [
    { kind: "output", id: makeId(), node: text(`Last login: ${formatLastLogin(bootDate)} on ttys001`, true) },
    { kind: "output", id: makeId(), node: blank() },
  ]);

  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootTyped, setBootTyped] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [lifeFlow, setLifeFlow] = useState<LifeFlowState>({ mode: "idle" });
  const [vimCommand, setVimCommand] = useState("");
  const [cwd, setCwd] = useState<string[]>([]);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const promptPath = cwdToDisplay(cwd);
  const isOverlayOpen = lifeFlow.mode === "show_terms" || matrixOpen;

  const suggestion = useMemo(() => {
    const q = value.trim();
    if (!q) return null;

    const pathMatch = value.match(PATH_COMMANDS);
    if (pathMatch) {
      const [, cmd, partial] = pathMatch;
      const completed = completePath(partial, cwd, cmd === "cd");
      if (!completed || completed === partial) return null;
      return `${cmd} ${completed}`;
    }

    const match = AVAILABLE_COMMANDS.find((c) => c.startsWith(q));
    if (!match || match === q) return null;
    return match;
  }, [value, cwd]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const pushNodes = useCallback((nodes: LineNode[]) => {
    setEntries((prev) => [...prev, ...nodes.map((n) => ({ kind: "output" as const, id: makeId(), node: n }))]);
  }, []);

  const pushText = useCallback(
    (lines: string[], muted?: boolean) => {
      pushNodes(lines.map((l) => text(l, muted)));
    },
    [pushNodes],
  );

  const showPrivateProject = useCallback(
    (title: string) => {
      const lines = PRIVATE_PROJECT_DESCRIPTIONS[title];
      if (!lines) return;
      pushNodes([blank(), ...prose(lines)]);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [pushNodes],
  );

  const closeMatrix = useCallback(() => {
    setMatrixOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const runTheme = useCallback(
    (arg: string) => {
      const current = getStoredTheme();
      if (!arg) {
        pushNodes([
          text("Available themes:"),
          ...THEME_NAMES.map((n) => (n === current ? node(["  * ", em(n, "status")]) : node([`  - ${n}`]))),
          blank(),
          text("Usage: theme <name>", true),
        ]);
        return;
      }
      if (applyTheme(arg)) pushText([`Theme set to '${arg}'.`], true);
      else pushText([`Unknown theme: ${arg}`, `Try: ${THEME_NAMES.join(", ")}`], true);
    },
    [pushNodes, pushText],
  );

  const runFs = useCallback(
    (cmd: string, arg: string) => {
      if (cmd === "pwd") {
        pushText([cwdToDisplay(cwd)]);
        return;
      }

      if (cmd === "ls") {
        const { node: target } = resolve(arg || ".", cwd);
        if (!target) pushText([`ls: cannot access '${arg}': No such file or directory`], true);
        else if (target.type === "file") pushText([target.name]);
        else pushNodes(lsNodes(target));
        return;
      }

      if (cmd === "tree") {
        const { node: target } = resolve(arg || ".", cwd);
        if (!target || target.type !== "dir") pushText([`tree: ${arg || "."}: Not a directory`], true);
        else pushNodes(treeNodes(target));
        return;
      }

      if (cmd === "cd") {
        if (!arg) {
          setCwd([]);
          return;
        }
        const { segments, node: target } = resolve(arg, cwd);
        if (!target) pushText([`cd: no such file or directory: ${arg}`], true);
        else if (target.type === "file") pushText([`cd: not a directory: ${arg}`], true);
        else setCwd(segments);
        return;
      }

      // cat
      if (!arg) {
        pushText(["usage: cat <file>"], true);
        return;
      }
      const { node: target } = resolve(arg, cwd);
      if (!target) pushText([`cat: ${arg}: No such file or directory`], true);
      else if (target.type === "dir") pushText([`cat: ${arg}: Is a directory`], true);
      else pushNodes(target.content());
    },
    [cwd, pushNodes, pushText],
  );

  const runCommand = useCallback(
    (raw: string) => {
      const command = raw.trim();

      if (!command) {
        if (lifeFlow.mode === "awaiting_consent") {
          if (!lifeFlow.termsViewed) {
            pushText(["Please view the terms and conditions first (click the link), then answer Y/n."], true);
            return;
          }
          pushText(["Opening /life ..."], true);
          setLifeFlow({ mode: "idle" });
          router.push("/life");
        }
        return;
      }

      setEntries((prev) => [...prev, { kind: "input", id: makeId(), command, path: cwdToDisplay(cwd) }]);
      setHistory((prev) => (prev[prev.length - 1] === command ? prev : [...prev, command]));
      setHistoryIdx(null);

      if (lifeFlow.mode === "awaiting_consent") {
        const normalized = command.toLowerCase();
        const isYes = normalized === "y" || normalized === "yes";
        const isNo = normalized === "n" || normalized === "no";

        if (!isYes && !isNo) {
          pushText(["Please answer with Y or n."], true);
          return;
        }

        if (isNo) {
          pushText(["Aborted."], true);
          setLifeFlow({ mode: "idle" });
          return;
        }

        if (!lifeFlow.termsViewed) {
          pushText(["Please view the terms and conditions first (click the link), then answer Y/n."], true);
          return;
        }

        pushText(["Opening /life ..."], true);
        setLifeFlow({ mode: "idle" });
        router.push("/life");
        return;
      }

      if (command === "exit") {
        onClose?.();
        return;
      }

      if (command === "clear") {
        setEntries([{ kind: "output", id: makeId(), node: blank() }]);
        return;
      }

      if (command === "download") {
        pushText(["Downloading cv.pdf ..."], true);
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
        const needle = "terms and conditions";
        const idx = LIFE_PROMPT_LINE.indexOf(needle);
        pushNodes([
          {
            parts: [
              LIFE_PROMPT_LINE.slice(0, idx),
              action("terms", needle),
              LIFE_PROMPT_LINE.slice(idx + needle.length),
            ],
            muted: true,
          },
          blank(true),
        ]);
        setLifeFlow({ mode: "awaiting_consent", termsViewed: false });
        return;
      }

      const [cmd, ...rest] = command.split(/\s+/);
      const arg = rest.join(" ");

      if (cmd === "theme") {
        runTheme(arg);
        return;
      }

      if (cmd === "neofetch") {
        pushNodes(
          buildNeofetch({
            user: USER,
            host: HOST,
            os: detectOs(navigator.userAgent),
            uptime: `${Math.floor(performance.now() / 60000)}m ${Math.floor(performance.now() / 1000) % 60}s`,
            resolution: `${window.innerWidth}x${window.innerHeight}`,
            theme: getStoredTheme(),
          }),
        );
        return;
      }

      if (cmd === "matrix") {
        setMatrixOpen(true);
        return;
      }

      if (cmd === "portfolio") {
        pushText(["Opening traditional layout ..."], true);
        router.push("/portfolio");
        return;
      }

      if (cmd === "sudo") {
        pushText([`[sudo] password for ${USER}:`, "nice try 😏"], true);
        return;
      }

      if (cmd === "pwd" || cmd === "ls" || cmd === "cd" || cmd === "cat" || cmd === "tree") {
        runFs(cmd, arg);
        return;
      }

      const exact = TERMINAL_COMMANDS[command];
      if (exact) {
        pushNodes(exact.nodes);
        return;
      }

      pushText([`Command not found: ${command}`, "Type 'help' to list available commands."], true);
    },
    [cwd, lifeFlow, onClose, pushNodes, pushText, router, runFs, runTheme],
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
    pushText(["Terms closed. Continue? Y/n"], true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [pushText, vimCommand]);

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

      if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        setValue("");
        runCommand("clear");
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const next = historyIdx === null ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(next);
        setValue(history[next] ?? "");
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIdx === null) return;
        const next = historyIdx + 1;
        if (next >= history.length) {
          setHistoryIdx(null);
          setValue("");
          return;
        }
        setHistoryIdx(next);
        setValue(history[next] ?? "");
      }
    },
    [history, historyIdx, isBooting, isOverlayOpen, runCommand, suggestion],
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
          ...TERMINAL_COMMANDS[bootCommand].nodes.map((n) => ({ kind: "output" as const, id: makeId(), node: n })),
          { kind: "output", id: makeId(), node: blank() },
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
    promptPath,
    matrixOpen,

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
    closeMatrix,
    closeTerminal: onClose,
    minimizeTerminal: onMinimize,
  };
}
