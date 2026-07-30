# @metabindai/bindjs-react

The official React renderer for [BindJS](https://www.npmjs.com/package/@metabindai/bindjs-runtime), the cross-platform declarative UI framework at the heart of [Metabind](https://www.metabind.ai), the hosted platform for MCP Apps. It draws resolved BindJS components as React DOM — use it to render BindJS content inside your own React app, and it's the same renderer that draws Interactive Tools in the sandboxed iframes MCP hosts use.

This package sits on top of [`@metabindai/bindjs-runtime`](https://www.npmjs.com/package/@metabindai/bindjs-runtime), which evaluates component definitions — state, modifiers, and component trees — independent of any UI framework. The runtime resolves what to draw; this package draws it.

## Install

```bash
npm install @metabindai/bindjs-react react react-dom styled-components
```

`react` (`^18.3.1`), `react-dom` (`^18.3.1`), and `styled-components` (`^6.1.14`) are peer dependencies — your app provides them, which avoids duplicate-React "invalid hook call" errors. `@metabindai/bindjs-runtime` is a regular dependency and installs automatically.

## Usage

Create a `BindJSRuntime`, register a component's JavaScript source, and pass both to `<Renderer>`:

```tsx
import { useMemo } from 'react'
import { BindJSRuntime } from '@metabindai/bindjs-runtime'
import { Renderer } from '@metabindai/bindjs-react'

// A BindJS component definition, compiled to plain JavaScript
// (`export default` becomes `exports.default` after transpilation).
const source = `exports.default = defineComponent({
    body: () => VStack({ spacing: 8 }, [
        Text("Hello from BindJS").font("largeTitle"),
    ]),
})`

export function App() {
    const runtime = useMemo(() => {
        const rt = new BindJSRuntime()
        rt.registerComponent('Hello', source)
        return rt
    }, [])

    return <Renderer runtime={runtime} componentName="Hello" />
}
```

`<Renderer>` also accepts an `environment` prop for values like the color scheme, for example `environment={{ colorScheme: 'dark' }}`.

Other notable exports:

- `useBindJSRuntime()` — a hook that creates and memoizes a `BindJSRuntime` for the lifetime of a component.
- `AssetsProvider`, `ContentProvider`, and `FontManager` — context providers that supply assets, content lookup, and fonts to rendered components.

For a working end-to-end setup, see the [playground example](../../examples/playground) in this repository — a live editor and preview built on this package.

## Type definitions

The published package includes a `types/` directory (`types/metabind.d.ts` and friends) declaring the BindJS authoring API — components, modifiers, and data types. The playground loads these into Monaco for IntelliSense, using Vite's `?raw` import to read them as strings; you can do the same in any in-browser editor:

```ts
import METABIND_TYPES from '@metabindai/bindjs-react/types/metabind.d.ts?raw'
```

## Developing

This package lives in the [bindjs-runtime](https://github.com/metabindai/bindjs-runtime) monorepo. Build and test from the repository root:

```bash
pnpm install
pnpm build
pnpm test
```

See the [repository README](../../README.md) for the playground workflow, local linking from a consumer repo, and publishing.

## License

Apache License 2.0. See [`LICENSE`](../../LICENSE).
