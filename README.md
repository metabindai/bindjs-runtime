# BindJS

Runtime and React renderer for BindJS, published to npm under the `@metabindai` scope.

| Package | npm | Path |
| --- | --- | --- |
| Runtime | [`@metabindai/bindjs-runtime`](https://www.npmjs.com/package/@metabindai/bindjs-runtime) | `packages/runtime` |
| React renderer | [`@metabindai/bindjs-react`](https://www.npmjs.com/package/@metabindai/bindjs-react) | `packages/react` |

`@metabindai/bindjs-react` depends on `@metabindai/bindjs-runtime`. Both are
private (`publishConfig.access = restricted`).

## Develop

```sh
pnpm install
pnpm build      # builds runtime, then react (topological)
pnpm test       # runtime vitest suite
```

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
