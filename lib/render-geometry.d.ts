/** Render geometry screen mode. */
export type RenderGeometryScreenMode = "alternate-screen" | "main-screen" | "split-footer"
/** Render geometry. */
export interface RenderGeometry {
  effectiveFooterHeight: number
  renderOffset: number
  renderWidth: number
  renderHeight: number
}
/** Calculate render geometry. */
export declare function calculateRenderGeometry(
  screenMode: RenderGeometryScreenMode,
  terminalWidth: number,
  terminalHeight: number,
  footerHeight: number,
): RenderGeometry
