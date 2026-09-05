import { SpinnerRenderable } from "./index.js";
declare module "ax-tui/solid" {
    interface AxTuiComponents {
        spinner: typeof SpinnerRenderable;
    }
}
