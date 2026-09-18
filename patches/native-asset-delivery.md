# native-asset-delivery

The JSR artifact cannot contain oversized native binaries. Keep the existing
platform/architecture/libc mapping, but delegate library preparation to
`native/index.js` through its public `prepareNativeLibrary` API.

`src/zig.ts` imports the package-owned resolver implemented in
`native/source/`. It preserves package-relative bundled assets,
native ABI names, FFI pointer guards, and renderer behavior. Missing bundled
assets use a bounded, manifest-verified cache/download path; offline mode
never accesses the network.

Regression guards: `script/tui-patches.test.ts` and
`test/native-delivery.test.ts`. Regenerate with `pnpm run build:renderer`;
never hand-edit the hashed renderer chunk.
