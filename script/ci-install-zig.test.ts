import { expect, test } from "vitest"
import { patchTbdTargets, zigArchive } from "./ci-install-zig.js"

test("pinned Zig archives cover the Quality workflow hosts", () => {
  expect(zigArchive("linux", "x64").name).toBe("zig-x86_64-linux-0.15.2.tar.xz")
  expect(zigArchive("darwin", "arm64").name).toBe("zig-aarch64-macos-0.15.2.tar.xz")
  expect(zigArchive("win32", "x64").name).toBe("zig-x86_64-windows-0.15.2.zip")
  expect(zigArchive("linux", "x64").sha256).toMatch(/^[a-f0-9]{64}$/)
  expect(() => zigArchive("freebsd", "x64")).toThrow("No pinned Zig")
})

test("macOS stub targets gain an arm64-macos alias without repeating it", () => {
  const stub = ["targets: [ arm64e-macos, arm64e-maccatalyst ]", "targets: [ arm64-macos, arm64e-macos ]"].join("\n")
  expect(patchTbdTargets(stub)).toBe(
    ["targets: [ arm64-macos, arm64e-macos, arm64e-maccatalyst ]", "targets: [ arm64-macos, arm64e-macos ]"].join("\n"),
  )
})
