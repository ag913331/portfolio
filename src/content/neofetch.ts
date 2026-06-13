import { blank, em, node } from "@/content/format";
import { PROFILE } from "@/content/resume";

export type NeofetchInfo = {
  user: string;
  host: string;
  os: string;
  uptime: string;
  resolution: string;
  theme: string;
};

const LOGO = [
  " ___________ ",
  "|  _______  |",
  "| |       | |",
  "| | >_    | |",
  "| |       | |",
  "| |_______| |",
  "|___________|",
  " _|_______|_ ",
  "/___________\\",
];

const LOGO_WIDTH = 15;

export function buildNeofetch(info: NeofetchInfo): LineNode[] {
  const rows: Inline[][] = [
    [em(`${info.user}@${info.host}`, "status")],
    ["-----------------"],
    [em("OS:         ", "dir"), info.os],
    [em("Host:       ", "dir"), "Portfolio Terminal"],
    [em("Kernel:     ", "dir"), PROFILE.kernel],
    [em("Uptime:     ", "dir"), info.uptime],
    [em("Shell:      ", "dir"), "react-shell 19"],
    [em("Resolution: ", "dir"), info.resolution],
    [em("Theme:      ", "dir"), info.theme],
    [em("Stack:      ", "dir"), "Next.js · TypeScript · Linux"],
  ];

  const height = Math.max(LOGO.length, rows.length);
  const lines: LineNode[] = [];

  for (let i = 0; i < height; i++) {
    const logo = (LOGO[i] ?? "").padEnd(LOGO_WIDTH);
    lines.push(node([em(logo, "dir"), "  ", ...(rows[i] ?? [])]));
  }

  lines.push(blank());
  lines.push(
    node([
      em(`${" ".repeat(LOGO_WIDTH)}  `, "dir"),
      em("███ ", "institution"),
      em("███ ", "status"),
      em("███ ", "degree2"),
      em("███ ", "degree3"),
      em("███", "period"),
    ]),
  );

  return lines;
}
