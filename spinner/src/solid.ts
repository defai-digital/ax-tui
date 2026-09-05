import { SpinnerRenderable } from "./index.js"
import { extend } from "ax-tui/solid"

declare module "ax-tui/solid" {
  interface AxTuiComponents {
    spinner: typeof SpinnerRenderable
  }
}

extend({ spinner: SpinnerRenderable })
