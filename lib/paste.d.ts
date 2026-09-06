/** Paste kind. */
export type PasteKind = "text" | "binary" | "unknown"
/** Paste metadata. */
export interface PasteMetadata {
  mimeType?: string
  kind?: PasteKind
}
/** Decode paste bytes. */
export declare function decodePasteBytes(bytes: Uint8Array): string
/** Strip ansi sequences. */
export declare function stripAnsiSequences(text: string): string
