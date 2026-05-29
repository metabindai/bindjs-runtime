# BindJS Playground (example)

A minimal, self-contained playground for exercising the BindJS **web renderer**
(`@metabindai/bindjs-react`). Edit a component on the left in TypeScript, see it
rendered live on the right.

It is deliberately small — **styled-components + Monaco + react-resizable-panels**
only. No `metabind-ui` / shadcn dependency. Everything `metabind-ui` provided in
the full Composer playground (header, sidebar, buttons, split view) is either a
few styled `div`s here or, in the case of the split view, `react-resizable-panels`
directly (which is what `metabind-ui`'s `SplitView` wraps anyway).

## How it works

The whole pipeline is small:

1. **Monaco** edits TypeScript; its built-in TS worker transpiles to JS via
   `getEmitOutput()` — no separate compiler needed
   (`src/components/CodeEditor.tsx`).
2. **`processComponentJs`** rewrites `export default …` → `exports.default = …`,
   the form the runtime evaluates (`src/lib/processComponent.ts`).
3. **The runtime** registers the code: `runtime.registerComponent(name, js)`, and
   the previews are read back with `runtime.getComponentPreviewsWithMetadata(name)`
   (`src/App.tsx`).
4. **The renderer** draws it: `<Renderer runtime componentName version usePreviews
   previewIndex />` builds the AST internally from the registered component
   (`src/components/Preview.tsx`).
5. **IntelliSense** comes from the `.d.ts` files shipped in the renderer package,
   loaded into Monaco as extra libs
   (`@metabindai/bindjs-react/types/*.d.ts?raw`).

## Run

From the repo root (workspace install picks up the local `packages/*`):

```sh
pnpm install
pnpm --filter @metabindai/bindjs-playground dev
```

Then open the printed URL (default http://localhost:5180).

> The renderer and runtime are consumed via `workspace:*` and resolve to their
> built `dist/`. If you change those packages, rebuild them
> (`pnpm --filter @metabindai/bindjs-react build`) to see the changes here.

## What to try

- Edit the text, add modifiers (`.padding()`, `.foregroundStyle(Color(...))`,
  `.font(...)`), wire up `useState`.
- Add entries to the `previews: [...]` array — they show up in the variant
  dropdown in the header.
- Toggle the preview color scheme (light/dark) in the header.
