export type TerminalCommandResult = {
  lines: string[];
};

export type TerminalCommands = Record<string, TerminalCommandResult>;

export const AVAILABLE_COMMANDS = [
  "system --init",
  "whoami",
  "contacts",
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
      "  → contacts",
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
      "🔧 Python Automation | DevOps Engineer | Fullstack Developer (React & Next.js)",
      "",
      "I'm a software engineer passionate about automation, system reliability, and cross-functional problem-solving.",
      "With a foundation in backend scripting and a strong grasp of DevOps culture and tools, I specialize in:",
      "",
      "★ Python Automation & DevOps",
      "  • Designed and deployed scalable CI/CD pipelines using Jenkins, Docker, Groovy, and Git",
      "  • Automated OS provisioning and upgrades across hundreds of servers with Python/Bash, Redfish API, and Airflow",
      "  • Implemented logging, backup, and monitoring solutions that improved operational stability and resolution times",
      "  • Worked hands-on with Linux kernel tuning, IPMI tooling, and image building (Cubic)",
      "",
      "★ Cloud & Infrastructure",
      "  • Built infrastructure and automation on both AWS and GCP (Cloud Run, Cloud Build, IAM, S3)",
      "  • Worked with Google Cloud services and cloud automation patterns in production",
      "  • Employed Ansible and Airflow for orchestrated deployments and task scheduling",
      "",
      "★ Fullstack Development",
      "  • Built and maintained front-end and internal tools using React, Next.js, and TanStack Query",
      "  • Developed backend APIs with Node.js, Prisma, and PostgreSQL",
      "  • Created customer-facing applications and internal dashboards, optimizing UX and performance",
      "",
      "★ Team & Delivery Focus",
      "  • Comfortable in Agile teams: sprint planning, documentation, cross-departmental communication",
      "  • Known for debugging under pressure, delivering reliable infrastructure, and bridging Dev and Ops teams",
      "",
      "★ I’m especially passionate about reducing manual toil through automation and helping teams ship faster, safer, and with confidence.",
      "",
    ],
  },
  contacts: {
    lines: [
      "  - GitHub: https://github.com/ag913331",
      "  - LinkedIn: www.linkedin.com/in/alexandro-georgiev-711b631b5",
      "  - Email: georgievalexandro@gmail.com",
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


