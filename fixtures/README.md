# Fixtures

Hand-written BindJS components that exercise the runtime and renderers, one
component per file under `<category>/<Name>.ts`. They are used in two places:

- **The playground catalog** (`examples/playground`) lists them in its sidebar
  to edit and preview against the local web renderer.
- **AST snapshot tests** (`packages/runtime/tests/fixtures`) render each one
  through the runtime and compare the output with a committed JSON file.

## Writing a fixture

```ts
const metadata = {
    title: "TestPadding",
    description: "Four labelled boxes, each padded on one edge only; the gap appears on the named edge.",
};

const body = () => (
    VStack({ spacing: 12 }, [
        // ...
    ])
);

const previews = [
    Self().previewName("Default"),
];

export default defineComponent({ metadata, body, previews });
```

- Use the modern form: a plain-object `metadata`, `properties` with `satisfies
  ComponentProperties` when there are any, and `export default defineComponent(...)`.
  Follow the `bindjs-formatting` conventions.
- Write `metadata.description` as the expected result. The playground shows it
  above the preview so whoever is checking knows what correct looks like.
- The file name is the component name. Every fixture is registered under its
  name, so fixtures can call each other (`LabeledRectangle(...)`). Don't rename
  one that another fixture calls.
- To cover several states in one fixture (tabs, modes), take them as a
  property and add one named preview per state, as in `layout/TestLayoutHStack.ts`.
  Snapshots only see the first render, so a state reachable only by tapping
  isn't tested.
- Keep renders deterministic: no `Math.random()` or `Date.now()` in the body.
  The snapshot test renders everything twice and fails on any difference.

## Snapshot tests

```sh
pnpm test:fixtures      # compare every fixture's AST with packages/runtime/tests/fixtures/ast/
pnpm fixtures:accept    # rewrite the snapshots after an intended change
```

Each snapshot holds the AST for the fixture's body (default props) and for each
preview, plus any errors the runtime logged. `ForEach` is lazy in the AST
(renderers call back into the runtime per item), so the test expands it the way
the web renderer does and stores the items under `$items`. That key is added by
the test; it isn't part of the AST renderers receive. A new fixture gets its snapshot on
the first local run. CI doesn't write snapshots, so commit them.

The AST is the contract the web, SwiftUI and Compose renderers all consume, so
a snapshot diff is a cross-platform output change:

- **Unexpected diff:** a regression. Fix the runtime.
- **Intended diff:** accept it, and call out the change in the PR, because the
  native renderers have to handle it too.

To see how the output changed between two releases:

```sh
git diff v1.0.10 v1.0.11 -- packages/runtime/tests/fixtures/ast
```

The snapshots cover the first render only. They don't cover state after an
interaction, and they don't cover how a renderer draws the AST.
