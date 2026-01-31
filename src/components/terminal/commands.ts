export type TerminalCommandResult = {
  lines: string[];
};

export type TerminalCommands = Record<string, TerminalCommandResult>;

export const AVAILABLE_COMMANDS = [
  "system --init",
  "whoami",
  "skills",
  "projects",
  "life",
  "help",
  "clear",
] as const;

export const TERMINAL_COMMANDS: TerminalCommands = {
  "system --init": {
    lines: [
      "System initialized...",
      "",
      "Welcome to the Dev/Ops Environment.",
      "",
      "User: DevOps Architect",
      "Status: Online",
      "Kernel: v5.15.0-generic",
      "",
      "Available commands:",
      "  → whoami",
      "  → skills",
      "  → projects",
      "  → life",
      "  → clear",
      "",
      "Tip: type 'help' to list commands.",
    ],
  },
  whoami: {
    lines: [
      "Hi, I'm Alexandro Georgiev.",
      "Full‑stack engineer with a DevOps + Linux administration background.",
      "",
      "I build production systems end‑to‑end: apps, infra, CI/CD, observability, and security.",
      "",
      "Links:",
      "  - GitHub: https://github.com/<your-handle>",
      "  - LinkedIn: https://linkedin.com/in/<your-handle>",
      "  - Email: you@example.com",
    ],
  },
  skills: {
    lines: [
      "Core:",
      "  - TypeScript / Node.js, React, Next.js",
      "  - API design (REST), auth, data modeling",
      "",
      "DevOps:",
      "  - Linux, Bash, networking fundamentals",
      "  - Docker, containers, reverse proxies",
      "  - CI/CD (GitHub Actions), IaC (Terraform)",
      "  - Monitoring (Prometheus/Grafana), logging",
    ],
  },
  projects: {
    lines: [
      "Featured projects:",
      "  - <Project A>: <one-liner>  (link)",
      "  - <Project B>: <one-liner>  (link)",
      "  - <Project C>: <one-liner>  (link)",
      "",
      "Tip: replace these placeholders in src/components/terminal/commands.ts",
    ],
  },
  life: {
    lines: [
      "Outside of work:",
      "  - Homelab tinkering, self-hosting, automation",
      "  - Linux customization, CLI tooling",
      "  - Learning systems design + security",
    ],
  },
  help: {
    lines: [
      "Commands:",
      ...AVAILABLE_COMMANDS.map((c) => `  - ${c}`),
      "",
      "Notes:",
      "  - Commands are case-sensitive.",
      "  - Use ↑ / ↓ to cycle history.",
      "  - Use Ctrl+L to clear.",
    ],
  },
};


