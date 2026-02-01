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

    type CSSModuleClasses = Record<string, string>;

    type RendererCallbacks = {
        onTermsClick: () => void;
        onShowPrivateProject: (title: string) => void;
        onShowNdaDetails: () => void;
        getDegreeClass: (idx: number) => string;
    };
}

export {};