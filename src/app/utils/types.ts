declare global {
    type TerminalCommandResult = {
        lines: string[];
    };

    type TerminalCommands = Record<string, TerminalCommandResult>;

    type Entry =
        | { kind: "output"; id: string; text: string; muted?: boolean }
        | { kind: "input"; id: string; command: string };

    type LifeFlowState =
        | { mode: "idle" }
        | { mode: "awaiting_consent"; termsViewed: boolean }
        | { mode: "show_terms" };
}

export {};