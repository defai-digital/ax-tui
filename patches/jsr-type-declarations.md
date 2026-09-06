# JSR type declarations

JSR rewrites only imports in its analyzed module graph. Every public JavaScript
entrypoint must identify its shipped declaration with `@ts-self-types`, including
Node-specific shims whose declaration has a different basename. Otherwise the
registry may omit type export conditions and leave bare self-imports unrewritten.

`script/tui-patches.ts` derives the declaration paths from the package export
contract, checks their existence, and applies idempotent annotations. Spinner
source annotations are compiler-owned and survive rebuilding `spinner/dist`.

The existing component module augmentations and tree-sitter worker global are
part of the declaration contract. JSR fast-type analysis does not support them;
publication explicitly allows slow types while retaining those declarations,
ordinary TypeScript checks, and consumer qualification.
