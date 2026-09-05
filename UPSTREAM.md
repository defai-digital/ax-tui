# Upstream provenance

`ax-tui` is an AX-owned package containing a derived renderer snapshot originally published by the OpenTUI
project under the MIT license. Public package identity, release staging, patches, and product integration are maintained
by DEFAI Digital; derivation and copyright notices remain intact.

Design input (read-only, no code extraction) also comes from other coding-agent CLIs, notably Kimi Code and
Grok Build, as documented in the README's design-influences section.

## Pinned native baseline

The authoritative native record is [`vendor/manifest.json`](./vendor/manifest.json). It records:

- upstream version and repository;
- retrieval timestamp;
- platform package and target metadata;
- registry integrity;
- native library size and SHA-256; and
- license hash.

JavaScript/declaration artifacts and native libraries must be refreshed together unless ABI compatibility is proven by
the packed Node distribution and renderer test suite. A package consolidation must never be used as an implicit upstream
version upgrade.

## Refresh policy

1. Pin the exact upstream source/package/native version.
2. Fetch native artifacts through `pnpm run vendor`.
3. Apply AX divergences through `pnpm run apply:patches`.
4. Run all checks listed in `MAINTENANCE.md`.
5. Update the manifest, this record when necessary, and `DIVERGENCES.md` in the same change.
