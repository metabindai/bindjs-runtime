# CLAUDE.md

Guidance for AI agents (and humans) contributing to this repo.

## What this is

The canonical BindJS runtime and React renderer — a pnpm monorepo publishing two npm packages under the public `@metabindai` scope. BindJS is the cross-platform declarative UI framework behind [Metabind](https://metabind.ai); full reference at [docs.metabind.ai/bindjs/introduction](https://docs.metabind.ai/bindjs/introduction).

| Package | Path | Role |
|---|---|---|
| `@metabindai/bindjs-runtime` | `packages/runtime` | Core runtime: hooks, property helpers, component evaluation — executes component code and emits the JSON AST |
| `@metabindai/bindjs-react` | `packages/react` | The official web/React renderer; depends on the runtime via `workspace:^` |
| `@metabindai/bindjs-playground` (private) | `examples/playground` | Monaco live editor + preview against the local build |

## Commands

```sh
pnpm install
pnpm build      # topological: runtime first, then react (react imports the runtime's dist/)
pnpm test       # the runtime vitest suite
```

Build order matters: `packages/react` and the playground consume `packages/runtime`'s `dist/` — always `pnpm build` after runtime changes before judging renderer or playground behavior.

Do not start the playground dev server (`pnpm --filter @metabindai/bindjs-playground dev`) from an agent session — dev servers run indefinitely and hang the session. Ask the user to run it in their own terminal (it serves on `:5180`).

## The AST is a cross-platform contract

The runtime's AST output is consumed by three renderers: `packages/react` here, and the native engines in [`bindjs-apple`](https://github.com/metabindai/bindjs-apple) (SwiftUI) and [`bindjs-android`](https://github.com/metabindai/bindjs-android) (Jetpack Compose). The native engines embed this runtime's bundled output (`packages/runtime`'s `build-runtime` rollup → `dist-runtime/runtime.js`), synced by maintainers.

Treat any change to the AST output shape, hook path semantics, or the component/modifier name registry (`packages/runtime/src/runtime/ComponentNames.js` — keep it alphabetically sorted) as a **breaking, cross-platform change**: it must land in all three renderers, not just the web one. Flag such changes prominently in your PR description.

## Types

`packages/react/types/metabind.d.ts` is the canonical TypeScript declaration of the BindJS authoring API. The public component reference is generated from it — keep signatures and JSDoc accurate when the API changes.

## Publishing (maintainers)

Per-package `pnpm --filter <pkg> build && npm publish -w packages/<pkg>`, or the `release.yml` workflow. `react`, `react-dom`, and `styled-components` are peer dependencies of `@metabindai/bindjs-react` — never move them to `dependencies`.

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
