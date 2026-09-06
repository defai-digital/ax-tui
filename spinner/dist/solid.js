/**
 * Registers the SolidJS `<spinner>` JSX tag for {@link SpinnerRenderable}.
 *
 * Import this module once so `<spinner>` resolves at runtime.
 *
 * @module
 */
import { SpinnerRenderable } from "./index.js";
import { extend } from "ax-tui/solid";
extend({ spinner: SpinnerRenderable });
