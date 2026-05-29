# BindJS

Runtime and React renderer for BindJS, published to npm under the `@metabindai` scope.

| Package | npm | Path |
| --- | --- | --- |
| Runtime | [`@metabindai/bindjs-runtime`](https://www.npmjs.com/package/@metabindai/bindjs-runtime) | `packages/runtime` |
| React renderer | [`@metabindai/bindjs-react`](https://www.npmjs.com/package/@metabindai/bindjs-react) | `packages/react` |
| Playground (example) | — | `examples/playground` |

`@metabindai/bindjs-react` depends on `@metabindai/bindjs-runtime`. Both are
private (`publishConfig.access = restricted`).

## Develop

```sh
pnpm install
pnpm build      # builds runtime, then react (topological)
pnpm test       # runtime vitest suite
```

## Playground example

`examples/playground` is a minimal live editor + preview for the web renderer:
edit a BindJS component in TypeScript on the left, see it rendered on the right.
It's the quickest way to exercise `@metabindai/bindjs-react` against the local
source.

```sh
pnpm build      # build the packages first (the example imports their dist/)
pnpm --filter @metabindai/bindjs-playground dev   # http://localhost:5180
```

It consumes the renderer and runtime via `workspace:*`, so it always tests your
local checkout — rebuild a package to see changes reflected. The whole pipeline
is small: Monaco's TS worker transpiles the source, `export default` is rewritten
to `exports.default`, `runtime.registerComponent(...)` registers it, and
`<Renderer runtime componentName … />` draws it. Stack is just
**styled-components + Monaco + react-resizable-panels** — no UI-kit dependency.
See `examples/playground/README.md` for details.

## Consuming from another repo during development

These packages are published to npm, but you can point a consumer at a local
checkout via pnpm overrides instead of publishing on every change:

```jsonc
// consumer root package.json
"pnpm": {
  "overrides": {
    "@metabindai/bindjs-runtime": "link:../metabind-packages/bindjs/packages/runtime",
    "@metabindai/bindjs-react":   "link:../metabind-packages/bindjs/packages/react"
  }
}
```

## Publishing

```sh
npm login                       # @metabindai org
pnpm --filter @metabindai/bindjs-runtime build && npm publish -w packages/runtime
pnpm --filter @metabindai/bindjs-react   build && npm publish -w packages/react
```

`react`, `react-dom`, and `styled-components` are **peer dependencies** of
`@metabindai/bindjs-react` — consumers provide them, avoiding duplicate-React
"invalid hook call" errors.
