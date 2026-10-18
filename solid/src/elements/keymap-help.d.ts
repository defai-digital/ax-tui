import { KeymapHelpRenderable, type KeymapHelpOptions } from "ax-tui";
import type { JSX } from "../../jsx-runtime.js";
/** Reactive display of caller-provided binding snapshots, with Solid owner cleanup. */
export declare function KeymapHelp(props: KeymapHelpOptions & {
    ref?: (help: KeymapHelpRenderable) => void;
}): JSX.Element;
