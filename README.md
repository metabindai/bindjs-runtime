# BindJS

BindJS is the open component language for agent UI. Write a UI component once, with its logic, and BindJS renders it as native SwiftUI, Jetpack Compose, and React, wherever an agent renders UI: as an [MCP Apps](https://github.com/modelcontextprotocol/ext-apps) View, as an A2UI catalog, or inside an in-app assistant. It is at the heart of [Metabind](https://metabind.ai), the hosted platform for MCP Apps. Components are written in JavaScript against a SwiftUI-shaped API and render as real native views, not web views. This repository is the canonical BindJS runtime and React renderer, published under the Apache License 2.0; the native rendering engines live in the companion [`bindjs-apple`](https://github.com/metabindai/bindjs-apple) and [`bindjs-android`](https://github.com/metabindai/bindjs-android) repositories.

> [!TIP]
> BindJS powers [Metabind](https://metabind.ai) — the hosted platform for [MCP Apps](https://github.com/modelcontextprotocol/ext-apps). Turn your app's UI and APIs into a governed agent that runs in your own app and across Claude, ChatGPT, and every MCP host. **[Start free at metabind.ai](https://www.metabind.ai/signup)** · **[Read the docs](https://docs.metabind.ai)**

Both packages here are published to npm under the `@metabindai` scope.

| Package | npm | Path |
| --- | --- | --- |
| Runtime | [`@metabindai/bindjs-runtime`](https://www.npmjs.com/package/@metabindai/bindjs-runtime) | `packages/runtime` |
| React renderer | [`@metabindai/bindjs-react`](https://www.npmjs.com/package/@metabindai/bindjs-react) | `packages/react` |
| Playground (example) | — | `examples/playground` |

`@metabindai/bindjs-react` depends on `@metabindai/bindjs-runtime`. Both are
public, published under the Apache License 2.0 (`publishConfig.access = public`).

## What BindJS looks like

A component packages a `body` render function and an optional `properties` schema into a `defineComponent` call. Properties are declared with helper functions, and the body's `props` argument is typed against the schema:

```typescript
const properties = {
  title: PropertyString({ title: "Title", required: true, defaultValue: "Welcome" }),
  showAction: PropertyBoolean({ title: "Show action", defaultValue: true }),
}

const body = (props, children) =>
  VStack({ spacing: 16 }, [
    Text(props.title)
      .font("headline")
      .foregroundStyle(Color("primary")),

    props.showAction
      ? Button("Get started", () => console.log("Tapped"))
      : Empty(),
  ])

export default defineComponent({
  metadata: { title: "Welcome card", description: "A simple example" },
  properties,
  body,
})
```

The runtime executes this with the BindJS globals injected — hooks, property helpers, animation builders — and emits a JSON AST; a renderer walks the AST and produces native views. Try it live in `examples/playground`.

## Documentation

The full BindJS reference lives on [docs.metabind.ai](https://docs.metabind.ai/bindjs/introduction):

- [Introduction](https://docs.metabind.ai/bindjs/introduction) — what BindJS is and how the runtime, AST, renderers, and modifier pipeline fit together
- [Quickstart](https://docs.metabind.ai/bindjs/quickstart) — author and preview your first component
- [Authoring](https://docs.metabind.ai/bindjs/authoring/components) — components, [properties](https://docs.metabind.ai/bindjs/authoring/properties), [state](https://docs.metabind.ai/bindjs/authoring/state), [hooks](https://docs.metabind.ai/bindjs/authoring/hooks), and the [MCP host bridge](https://docs.metabind.ai/bindjs/authoring/mcp-host)
- [Components](https://docs.metabind.ai/bindjs/components/layout-stacks) and [modifiers](https://docs.metabind.ai/bindjs/modifiers/layout-frame-and-padding) — the full catalog, entry by entry

## The BindJS repositories

| Repo | What it is |
|---|---|
| `bindjs-runtime` — this repository | The core runtime and React renderer: `@metabindai/bindjs-runtime` + `@metabindai/bindjs-react` |
| [`bindjs-apple`](https://github.com/metabindai/bindjs-apple) | The SwiftUI rendering engine for iOS, macOS, visionOS, tvOS, and watchOS |
| [`bindjs-android`](https://github.com/metabindai/bindjs-android) | The Jetpack Compose rendering engine for Android |

One BindJS definition renders natively on all three surfaces. All three repos are Apache 2.0; the engines ship inside the Metabind SDKs ([`metabind-apple`](https://github.com/metabindai/metabind-apple), [`metabind-android`](https://github.com/metabindai/metabind-android), [`metabind-web`](https://github.com/metabindai/metabind-web)).

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
    "@metabindai/bindjs-runtime": "link:../bindjs-runtime/packages/runtime",
    "@metabindai/bindjs-react":   "link:../bindjs-runtime/packages/react"
  }
}
```

The paths are relative to the consumer's root `package.json` — adjust them to wherever you cloned this repo.

## Publishing

```sh
npm login                       # @metabindai org
pnpm --filter @metabindai/bindjs-runtime build && npm publish -w packages/runtime
pnpm --filter @metabindai/bindjs-react   build && npm publish -w packages/react
```

`react`, `react-dom`, and `styled-components` are **peer dependencies** of
`@metabindai/bindjs-react` — consumers provide them, avoiding duplicate-React
"invalid hook call" errors.

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
