import { TimeToFirstDrawRenderable } from "ax-tui"
import type { ExtendedComponentProps } from "./types/elements.js"
declare module "ax-tui/solid" {
  interface AxTuiComponents {
    time_to_first_draw: typeof TimeToFirstDrawRenderable
  }
}
export type TimeToFirstDrawProps = ExtendedComponentProps<typeof TimeToFirstDrawRenderable>
export declare const TimeToFirstDraw: (props: TimeToFirstDrawProps) => any
