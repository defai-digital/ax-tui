import { Writable } from "stream"
/** Test write stream class. */
export declare class TestWriteStream extends Writable {
  readonly isTTY = true
  readonly columns: number
  readonly rows: number
  constructor(columns?: number, rows?: number)
  _write(_chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void
  getColorDepth(): number
}
/** Test stdout. */
export type TestStdout = TestWriteStream & NodeJS.WriteStream
/** Create test stdin. */
export declare function createTestStdin(): NodeJS.ReadStream
/** Create test stdout. */
export declare function createTestStdout(columns?: number, rows?: number): NodeJS.WriteStream
