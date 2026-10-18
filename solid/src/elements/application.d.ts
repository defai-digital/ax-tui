import { type CommandDefinition, type CommandPaletteHandle, type CommandPaletteOptions, type FocusScopeOptions, type Renderable } from "ax-tui";
export declare function useFocusManager(): {
    registerScope(root: Renderable, options?: FocusScopeOptions): () => void;
    focusNext: () => boolean;
    focusPrevious: () => boolean;
};
export declare function useCommands(): {
    register(command: CommandDefinition, target?: Renderable): () => void;
    execute: (id: string, context?: import("ax-tui").CommandContext) => Promise<import("ax-tui").CommandResult>;
    search: (query?: string, context?: import("ax-tui").CommandContext) => readonly import("ax-tui").CommandMetadata[];
};
export declare function useCommandPalette(): {
    show(options?: CommandPaletteOptions): CommandPaletteHandle;
};
