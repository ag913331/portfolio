import { blank, em, link, node, section, text } from "@/content/format";
import { TERMINAL_COMMANDS } from "@/content/commands";
import { EXPERIENCE, PRIVATE_PROJECTS, PUBLIC_PROJECTS } from "@/content/resume";

export type FsFile = { type: "file"; name: string; content: () => LineNode[] };
export type FsDir = { type: "dir"; name: string; children: FsNode[] };
export type FsNode = FsFile | FsDir;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const file = (name: string, content: () => LineNode[]): FsFile => ({ type: "file", name, content });
const dir = (name: string, children: FsNode[]): FsDir => ({ type: "dir", name, children });

function jobFile(job: (typeof EXPERIENCE)[number]): LineNode[] {
  return [
    section(`★ ${job.role}`),
    node([`company:  ${job.company}`]),
    node([`period:   `, em(job.period, job.current ? "periodCurrent" : "period")]),
    text(`type:     ${job.type}`),
    text(`location: ${job.location}`),
    blank(),
    ...job.description.map((b) => text(`  • ${b}`)),
  ];
}

function projectFile(p: (typeof PUBLIC_PROJECTS)[number]): LineNode[] {
  return [section(`★ ${p.name}`), text(p.description), blank(), node([`repo: `, link(p.repo, p.repo)])];
}

/** The home directory (~). The FS root is home; "/" and "~" both resolve here. */
export const ROOT: FsDir = dir("~", [
  file("about.txt", () => TERMINAL_COMMANDS.whoami.nodes),
  file("skills.txt", () => TERMINAL_COMMANDS.skills.nodes),
  file("education.json", () => TERMINAL_COMMANDS.education.nodes),
  file("languages.txt", () => TERMINAL_COMMANDS.languages.nodes),
  file("contact.txt", () => TERMINAL_COMMANDS.contacts.nodes),
  file("certifications.txt", () => TERMINAL_COMMANDS.certifications.nodes),
  dir(
    "experience",
    EXPERIENCE.map((j) => file(`${slug(j.company)}.md`, () => jobFile(j))),
  ),
  dir("projects", [
    ...PUBLIC_PROJECTS.map((p) => file(`${slug(p.name)}.md`, () => projectFile(p))),
    file("NDA.md", () => [
      text("Some projects are under NDA and can't be detailed here."),
      blank(),
      ...PRIVATE_PROJECTS.map((p) => text(`  • ${p.title}`)),
      blank(),
      text("Run `projects` for the interactive list."),
    ]),
  ]),
  file("cv.pdf", () => [text("Binary file. Run `download` to grab the PDF.", true)]),
]);

/** Resolve a path string (relative to cwd) into its segment list + the node it points at. */
export function resolve(input: string, cwd: string[]): { segments: string[]; node: FsNode | null } {
  const trimmed = input.trim();
  let segments: string[];
  let parts: string[];

  if (trimmed === "") {
    parts = [];
    segments = [...cwd];
  } else if (trimmed.startsWith("~")) {
    parts = trimmed.slice(1).split("/");
    segments = [];
  } else if (trimmed.startsWith("/")) {
    parts = trimmed.split("/");
    segments = [];
  } else {
    parts = trimmed.split("/");
    segments = [...cwd];
  }

  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      segments.pop();
      continue;
    }
    segments.push(part);
  }

  let current: FsNode = ROOT;
  for (const name of segments) {
    if (current.type !== "dir") return { segments, node: null };
    const child: FsNode | undefined = current.children.find((c) => c.name === name);
    if (!child) return { segments, node: null };
    current = child;
  }
  return { segments, node: current };
}

/** Display form of a cwd segment list, e.g. [] -> "~", ["projects"] -> "~/projects". */
export const cwdToDisplay = (cwd: string[]) => (cwd.length ? `~/${cwd.join("/")}` : "~");

const sortChildren = (children: FsNode[]) =>
  [...children].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

export function lsNodes(target: FsDir): LineNode[] {
  return sortChildren(target.children).map((c) => (c.type === "dir" ? node([em(`${c.name}/`, "dir")]) : text(c.name)));
}

export function treeNodes(target: FsDir): LineNode[] {
  const out: LineNode[] = [node([em(target.name, "dir")])];
  const walk = (d: FsDir, prefix: string) => {
    const kids = sortChildren(d.children);
    kids.forEach((c, i) => {
      const last = i === kids.length - 1;
      const branch = last ? "└── " : "├── ";
      if (c.type === "dir") {
        out.push(node([`${prefix}${branch}`, em(`${c.name}/`, "dir")]));
        walk(c, prefix + (last ? "    " : "│   "));
      } else {
        out.push(text(`${prefix}${branch}${c.name}`));
      }
    });
  };
  walk(target, "");
  return out;
}

/** Longest common prefix of a list of strings. */
function commonPrefix(items: string[]): string {
  if (items.length === 0) return "";
  let prefix = items[0];
  for (const s of items.slice(1)) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * Tab-completion for a partial path. Returns the completed path string, or null
 * if there is nothing to add. `onlyDirs` restricts matches (used by `cd`).
 */
export function completePath(partial: string, cwd: string[], onlyDirs = false): string | null {
  const slashIdx = partial.lastIndexOf("/");
  const dirPart = slashIdx >= 0 ? partial.slice(0, slashIdx + 1) : "";
  const leaf = slashIdx >= 0 ? partial.slice(slashIdx + 1) : partial;

  const { node: parent } = resolve(dirPart || ".", cwd);
  if (!parent || parent.type !== "dir") return null;

  const matches = parent.children.filter((c) => c.name.startsWith(leaf) && (!onlyDirs || c.type === "dir"));
  if (matches.length === 0) return null;

  if (matches.length === 1) {
    const only = matches[0];
    return `${dirPart}${only.name}${only.type === "dir" ? "/" : ""}`;
  }

  const prefix = commonPrefix(matches.map((c) => c.name));
  return prefix.length > leaf.length ? `${dirPart}${prefix}` : null;
}
