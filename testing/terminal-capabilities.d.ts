import type { CliRenderer } from "../renderer.js"
import type { TerminalCapabilities, TerminalInfo } from "../types.js"
/** Terminal capabilities overrides. */
export interface TerminalCapabilitiesOverrides extends Partial<Omit<TerminalCapabilities, "terminal">> {
  terminal?: Partial<TerminalInfo>
}
/** Create terminal capabilities. */
export declare function createTerminalCapabilities(overrides?: TerminalCapabilitiesOverrides): TerminalCapabilities
/** Set renderer capabilities. */
export declare function setRendererCapabilities(
  renderer: CliRenderer,
  overrides?: TerminalCapabilitiesOverrides,
): TerminalCapabilities
