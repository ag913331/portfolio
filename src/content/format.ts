// Builders that turn structured résumé data into renderable LineNode output.
// Keeping these tiny and explicit is what lets the renderer stay regex-free.

export const text = (s = "", muted?: boolean): LineNode => ({ parts: [s], muted });

export const blank = (muted?: boolean): LineNode => ({ parts: [""], muted });

export const section = (s: string, muted?: boolean): LineNode => ({ parts: [s], muted, block: "section" });

export const position = (s: string): LineNode => ({ parts: [s], block: "position" });

export const node = (parts: Inline[], opts?: { muted?: boolean; block?: LineNode["block"] }): LineNode => ({
  parts,
  ...opts,
});

export const link = (href: string, label: string, external = true): Inline => ({ kind: "link", href, label, external });

export const action = (kind: "project" | "nda", label: string, arg?: string): Inline => ({
  kind: "action",
  action: kind,
  label,
  arg,
});

export const em = (text: string, tone: EmTone): Inline => ({ kind: "em", text, tone });

/** Free-form prose: a leading ★ marks a section header, everything else is plain text. */
export const prose = (lines: string[], muted?: boolean): LineNode[] =>
  lines.map((l) => (l.trimStart().startsWith("★") ? section(l, muted) : text(l, muted)));
