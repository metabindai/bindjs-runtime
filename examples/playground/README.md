# BindJS Playground (example)

A minimal, self-contained playground and fixture catalog for exercising the
BindJS **web renderer** (`@metabindai/bindjs-react`). Pick a fixture in the
sidebar (or use the Scratch editor), edit it in TypeScript, see it rendered live.

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

## Fixture catalog

The sidebar lists every fixture in the repo's top-level `fixtures/<category>/<Name>.ts`; **Scratch**
at the top is the free-form editor. Selecting one opens its source in the editor
and renders it, with the fixture's `metadata.description` above the preview as
the "what correct looks like" note. The selection lives in the URL hash
(`#/layout/TestHStack`), so you can link to a specific case.

- Every fixture is registered in the runtime at startup under its file name, so
  fixtures can call each other (`LabeledRectangle(...)`, `ButtonStyleTest()`).
  Don't rename a fixture another one calls.
- Edits stay in the editor (an orange dot marks edited fixtures) until **Reset**
  or a page reload. To keep a change, edit the file itself.
- Runtime errors, which normally just render nothing, appear in the bar under
  the preview.
- **Adding a fixture:** see [`fixtures/README.md`](../../fixtures/README.md).
  New files appear without a restart.

## What to try

- Edit the text, add modifiers (`.padding()`, `.foregroundStyle(Color(...))`,
  `.font(...)`), wire up `useState`.
- Add entries to the `previews: [...]` array — they show up in the variant
  dropdown in the header.
- Toggle the preview color scheme (light/dark) in the header.
