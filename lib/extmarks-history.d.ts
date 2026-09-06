import type { Extmark } from "./extmarks.js"
/** Extmarks snapshot. */
export interface ExtmarksSnapshot {
  extmarks: Map<number, Extmark>
  nextId: number
}
/** Extmarks history class. */
export declare class ExtmarksHistory {
  private undoStack
  private redoStack
  saveSnapshot(extmarks: Map<number, Extmark>, nextId: number): void
  undo(): ExtmarksSnapshot | null
  redo(): ExtmarksSnapshot | null
  pushRedo(snapshot: ExtmarksSnapshot): void
  pushUndo(snapshot: ExtmarksSnapshot): void
  clear(): void
  canUndo(): boolean
  canRedo(): boolean
}
