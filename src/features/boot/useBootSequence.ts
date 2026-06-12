"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BootStep = { delayMs: number; line: string; muted?: boolean };

function makeBootScript(): BootStep[] {
  const steps: BootStep[] = [
    { delayMs: 100, line: "Welcome! We're getting your environment ready. It will take a few seconds..." },
    { delayMs: 500, line: "" },
    { delayMs: 450, line: "$ docker build -t portfolio:latest ." },
    { delayMs: 220, line: "[+] Building 0.1s (1/9) FINISHED" },
    { delayMs: 220, line: " => [internal] load build definition from Dockerfile", muted: true },
    { delayMs: 260, line: " => [internal] load .dockerignore", muted: true },
    { delayMs: 260, line: " => [internal] load metadata for docker.io/library/node:20-alpine", muted: true },
    { delayMs: 320, line: " => [1/5] FROM docker.io/library/node:20-alpine", muted: true },
    { delayMs: 420, line: " => [2/5] WORKDIR /app", muted: true },
    { delayMs: 420, line: " => [3/5] COPY package*.json ./", muted: true },
    { delayMs: 520, line: " => [4/5] RUN npm ci", muted: true },
    { delayMs: 520, line: " => [5/5] COPY . .", muted: true },
    { delayMs: 420, line: " => exporting to image", muted: true },
    { delayMs: 300, line: " => => writing image sha256:9a5c...d00d", muted: true },
    { delayMs: 300, line: " => => naming to portfolio:latest", muted: true },
    { delayMs: 500, line: "" },
    { delayMs: 450, line: "$ docker run --rm -p 3000:3000 portfolio:latest" },
    { delayMs: 260, line: "ready - started server on 0.0.0.0:3000, url: http://localhost:3000", muted: true },
    { delayMs: 260, line: "info  - Compiled successfully", muted: true },
    { delayMs: 500, line: "" },
    { delayMs: 450, line: "$ deploy --target=prod --strategy=blue-green" },
    { delayMs: 300, line: "deploy: uploading artifacts...", muted: true },
    { delayMs: 350, line: "deploy: provisioning runtime...", muted: true },
    { delayMs: 450, line: "deploy: warming up...", muted: true },
    { delayMs: 450, line: "deploy: switching traffic...", muted: true },
    { delayMs: 450, line: "deploy: done ✅", muted: true },
    { delayMs: 600, line: "" },
    { delayMs: 450, line: "Starting terminal..." },
  ];

  // Slow the sequence down slightly so it's easier to read.
  const DELAY_SCALE = 1.35;
  return steps.map((s) => ({ ...s, delayMs: Math.round(s.delayMs * DELAY_SCALE) }));
}

export function useBootSequence({ onDone }: { onDone: () => void }) {
  const script = useMemo(() => makeBootScript(), []);
  const [lines, setLines] = useState<Array<{ text: string; muted?: boolean }>>([]);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let t: number | null = null;

    const run = async () => {
      for (const step of script) {
        if (cancelled) return;
        await new Promise<void>((resolve) => {
          t = window.setTimeout(() => resolve(), step.delayMs);
        });
        if (cancelled) return;
        setLines((prev) => [...prev, { text: step.line, muted: step.muted }]);
      }

      if (cancelled) return;
      if (!doneRef.current) {
        doneRef.current = true;
        window.setTimeout(() => onDone(), 350);
      }
    };

    run();
    return () => {
      cancelled = true;
      if (t) window.clearTimeout(t);
    };
  }, [onDone, script]);

  const isDone = lines.length >= script.length;
  return { lines, isDone };
}


