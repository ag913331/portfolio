declare global {
    /** A semantically-emphasized inline span; maps to a CSS module class in the renderer. */
    type EmTone =
        | "status"
        | "period"
        | "periodCurrent"
        | "institution"
        | "degree1"
        | "degree2"
        | "degree3";

    /** A single piece of inline content within an output line. */
    type Inline =
        | string
        | { kind: "link"; href: string; label: string; external?: boolean }
        | { kind: "action"; action: "terms" | "project" | "nda"; label: string; arg?: string }
        | { kind: "em"; text: string; tone: EmTone };

    /** One rendered terminal output line, built from structured content (see content/format). */
    type LineNode = {
        parts: Inline[];
        muted?: boolean;
        block?: "section" | "position";
    };

    type CommandOutput = { nodes: LineNode[] };
    type TerminalCommands = Record<string, CommandOutput>;

    type Entry =
        | { kind: "output"; id: string; node: LineNode }
        | { kind: "input"; id: string; command: string };

    type CSSModuleClasses = Record<string, string>;

    type RendererCallbacks = {
        onTermsClick: () => void;
        onShowPrivateProject: (title: string) => void;
        onShowNdaDetails: () => void;
    };
}

export {};
