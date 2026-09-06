/**
 * Environment variable registry
 *
 * Usage:
 * ```ts
 * import { registerEnvVar, env } from "./lib/env.ts";
 *
 * // Register environment variables
 * registerEnvVar({
 *   name: "DEBUG",
 *   description: "Enable debug logging",
 *   type: "boolean",
 *   default: false
 * });
 *
 * registerEnvVar({
 *   name: "PORT",
 *   description: "Server port number",
 *   type: "number",
 *   default: 3000
 * });
 *
 * // Access environment variables
 * if (env.DEBUG) {
 *   console.log("Debug mode enabled");
 * }
 *
 * const port = env.PORT; // number
 * ```
 */
export interface EnvVarConfig {
  name: string
  description: string
  default?: string | boolean | number
  type?: "string" | "boolean" | "number"
}
/** Env registry. */
export declare const envRegistry: Record<string, EnvVarConfig>
/** Register env var. */
export declare function registerEnvVar(config: EnvVarConfig): void
/** Clear env cache. */
export declare function clearEnvCache(): void
/** Generate env markdown. */
export declare function generateEnvMarkdown(): string
/** Generate env colored. */
export declare function generateEnvColored(): string
/** Env. */
export declare const env: Record<string, any>
