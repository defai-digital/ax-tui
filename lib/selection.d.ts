import { Renderable } from "../Renderable.js"
import type { ViewportBounds } from "../types.js"
import { fonts } from "./ascii.font.js"
/** Text selection range in a renderable tree. */
export declare class Selection {
  private _anchor
  private _focus
  private _selectedRenderables
  private _touchedRenderables
  private _isActive
  private _isDragging
  private _isStart
  constructor(
    anchorRenderable: Renderable,
    anchor: {
      x: number
      y: number
    },
    focus: {
      x: number
      y: number
    },
  )
  get isStart(): boolean
  set isStart(value: boolean)
  get anchor(): {
    x: number
    y: number
  }
  get focus(): {
    x: number
    y: number
  }
  set focus(value: { x: number; y: number })
  get isActive(): boolean
  set isActive(value: boolean)
  get isDragging(): boolean
  set isDragging(value: boolean)
  get bounds(): ViewportBounds
  updateSelectedRenderables(selectedRenderables: Renderable[]): void
  get selectedRenderables(): Renderable[]
  updateTouchedRenderables(touchedRenderables: Renderable[]): void
  get touchedRenderables(): Renderable[]
  getSelectedText(): string
}
/** Local selection bounds. */
export interface LocalSelectionBounds {
  anchorX: number
  anchorY: number
  focusX: number
  focusY: number
  isActive: boolean
}
/** Convert global to local selection. */
export declare function convertGlobalToLocalSelection(
  globalSelection: Selection | null,
  localX: number,
  localY: number,
): LocalSelectionBounds | null
/** ASCIIFont selection helper class. */
export declare class ASCIIFontSelectionHelper {
  private getText
  private getFont
  private localSelection
  constructor(getText: () => string, getFont: () => keyof typeof fonts)
  hasSelection(): boolean
  getSelection(): {
    start: number
    end: number
  } | null
  shouldStartSelection(localX: number, localY: number, width: number, height: number): boolean
  onLocalSelectionChanged(localSelection: LocalSelectionBounds | null, width: number, height: number): boolean
}
