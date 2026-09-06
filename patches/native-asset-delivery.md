# native-asset-delivery

The JSR artifact cannot contain oversized native binaries. Keep the existing
platform/architecture/libc mapping, but delegate library preparation to
`native/index.js` through its public `prepareNativeLibrary` API.

The idempotent patch replaces only the native path assignment and imports
the package-owned resolver. It preserves package-relative bundled assets,
native ABI names, FFI pointer guards, and renderer behavior. Missing bundled
assets use a bounded, manifest-verified cache/download path; offline mode
never accesses the network.

Regression guards: `script/tui-patches.test.ts` and
`test/native-delivery.test.ts`. Apply via `pnpm run apply:patches`; never
hand-edit the hashed renderer chunk.
