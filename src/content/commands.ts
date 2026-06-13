import { toHref } from "@/lib/helpers";
import { action, blank, em, link, node, position, section, text } from "@/content/format";
import {
  CERTIFICATIONS,
  CONTACTS,
  EDUCATION,
  EXPERIENCE,
  LANGUAGES,
  PRIVATE_PROJECTS,
  PROFILE,
  PUBLIC_PROJECTS,
  SKILLS,
  WHOAMI,
} from "@/content/resume";

export const AVAILABLE_COMMANDS = [
  "whoami",
  "certifications",
  "contacts",
  "download",
  "education",
  "experience",
  "languages",
  "life",
  "projects",
  "skills",
  "neofetch",
  "theme",
  "matrix",
  "portfolio",
  "ls",
  "cd",
  "cat",
  "pwd",
  "tree",
  "help",
  "clear",
  "exit",
  "system --init",
] as const;

// The résumé commands surfaced in the `system --init` banner. Shell/fun commands
// are advertised separately in the tips so the banner stays focused.
const BANNER_HIDDEN = [
  "help",
  "clear",
  "exit",
  "system --init",
  "neofetch",
  "theme",
  "matrix",
  "portfolio",
  "ls",
  "cd",
  "cat",
  "pwd",
  "tree",
];
const MENU_COMMANDS = AVAILABLE_COMMANDS.filter((c) => !BANNER_HIDDEN.includes(c));

function systemInit(): LineNode[] {
  return [
    text("System initialized..."),
    blank(),
    text("Welcome to the Dev/Ops Environment."),
    blank(),
    text(`User: ${PROFILE.name}`),
    text(`Role: ${PROFILE.role}`),
    node(["Status: ", em(PROFILE.status, "status")]),
    text(`Kernel: ${PROFILE.kernel}`),
    blank(),
    text("Available commands:"),
    ...MENU_COMMANDS.map((c) => text(c === "download" ? "  → download   # download my CV" : `  → ${c}`)),
    blank(),
    text("Tip:"),
    text("  - Type 'help' to list commands."),
    text("  - Explore as a real shell: ls, cd, cat, tree"),
    text("  - For fun: neofetch, theme <name>, matrix"),
    text("  - Prefer a classic layout? Type 'portfolio'."),
    text("  - Use Ctrl+T to open a new terminal window."),
    text("  - Use Ctrl+L to clear the screen."),
  ];
}

function whoami(): LineNode[] {
  return [
    text(WHOAMI.intro[0]),
    blank(),
    text(WHOAMI.intro[1]),
    blank(),
    ...WHOAMI.groups.flatMap((g) => [section(`★ ${g.title}`), ...g.bullets.map((b) => text(`  • ${b}`)), blank()]),
    section(`★ ${WHOAMI.outro}`),
    blank(),
  ];
}

function contacts(): LineNode[] {
  return CONTACTS.map((c) => {
    const href = toHref(c.value) ?? c.value;
    return node([`  - ${c.label}: `, link(href, c.value, !href.startsWith("mailto:"))]);
  });
}

function certifications(): LineNode[] {
  const out: LineNode[] = [text("Certifications:"), blank()];

  CERTIFICATIONS.forEach((c, i) => {
    out.push(position(`o--------> ${c.title}`));
    out.push(text(`|          issued_by: ${c.issuedBy}`));
    out.push(text(`|          date: ${c.date}`));

    const href = toHref(c.credential);
    if (href && !href.startsWith("mailto:")) {
      out.push(node(["|          credential: 🔗 ", link(href, "Show credential")]));
    } else {
      out.push(text(`|          credential: ${c.credential}`));
    }

    if (i < CERTIFICATIONS.length - 1) out.push(text("|"));
  });

  return out;
}

function education(): LineNode[] {
  const out: LineNode[] = [text("{"), text(`     "education": [`)];

  EDUCATION.forEach((e, i) => {
    const degreeTone = `degree${i + 1}` as EmTone;
    const last = i === EDUCATION.length - 1;

    out.push(text("         {"));
    out.push(node([`             "institution": "`, em(e.institution, "institution"), `",`]));
    out.push(node([`             "degree": "`, em(e.degree, degreeTone), `",`]));
    out.push(text(`             "field_of_study": "${e.fieldOfStudy}",`));
    out.push(text(`             "period": "${e.period}"`));
    out.push(text(last ? "         }" : "         },"));
  });

  out.push(text("     ]"));
  out.push(text("}"));
  return out;
}

function experience(): LineNode[] {
  const out: LineNode[] = [text("Experience:"), blank(), text("|")];

  EXPERIENCE.forEach((j, i) => {
    out.push(position(`o--------> ${j.role}`));
    out.push(text(`|          type: ${j.type}`));
    out.push(node([`|          period: `, em(j.period, j.current ? "periodCurrent" : "period")]));
    out.push(text(`|          company: ${j.company}`));
    out.push(text(`|          location: ${j.location}`));
    out.push(text(`|          description:`));
    j.description.forEach((b) => out.push(text(`|            * ${b}`)));

    if (i < EXPERIENCE.length - 1) {
      out.push(text("|"));
      out.push(text("|"));
    }
  });

  return out;
}

function languages(): LineNode[] {
  return [text("Languages:"), ...LANGUAGES.map((l) => text(`  - ${l.name} — ${l.level}`))];
}

function skills(): LineNode[] {
  return SKILLS.flatMap((g, i) => [
    section(`★ ${g.title}`),
    ...g.items.map((s) => text(`  - ${s}`)),
    ...(i < SKILLS.length - 1 ? [blank()] : []),
  ]);
}

function projects(): LineNode[] {
  return [
    blank(),
    text("Public (open-source):"),
    ...PUBLIC_PROJECTS.flatMap((p) => [
      text(`  - ${p.name} — ${p.description}`),
      node([`    - repo: `, link(p.repo, p.repo)]),
      blank(),
    ]),
    node(["Private (NDA): ", action("nda", "Details")]),
    ...PRIVATE_PROJECTS.map((p) => node([`  - ${p.title} — `, action("project", "Show project description", p.title)])),
  ];
}

function help(): LineNode[] {
  return [
    text("Commands:"),
    ...AVAILABLE_COMMANDS.map((c) => text(c === "download" ? `  - ${c}  # download my CV` : `  - ${c}`)),
    blank(),
    text("Notes:"),
    text("  - Commands are case-sensitive."),
    text("  - Use ↑ / ↓ to cycle history."),
    text("  - Use Ctrl+L to clear."),
    text("  - Use Tab to autocomplete commands."),
  ];
}

export const TERMINAL_COMMANDS: TerminalCommands = {
  "system --init": { nodes: systemInit() },
  whoami: { nodes: whoami() },
  contacts: { nodes: contacts() },
  certifications: { nodes: certifications() },
  education: { nodes: education() },
  experience: { nodes: experience() },
  languages: { nodes: languages() },
  skills: { nodes: skills() },
  projects: { nodes: projects() },
  help: { nodes: help() },
};
