// AST snapshot tests for the shared fixtures in the repo's top-level fixtures/.
//
// Every fixture is rendered through the runtime (its body with default props,
// then each preview) and the resulting AST is compared against a committed JSON
// file under ./ast/<category>/<Name>.json. ForEach is lazy in the AST (renderers
// call back into the runtime per item), so the test expands it the way the web
// renderer does and records the items under a test-only `$items` key. Because the AST is the contract all
// three renderers consume, any diff here is a cross-platform output change:
// review it, and if it's intended, accept it with `pnpm test --run -u`.
// Diffing those files between two tags shows how the output changed across a release.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it, expect } from 'vitest';
import { BindJSRuntime } from '../../src/runtime/BindJSRuntime.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(here, '../../../../fixtures');
const SNAPSHOT_DIR = path.join(here, 'ast');

// Fixed so snapshots don't depend on the machine running them.
const ENVIRONMENT = { colorScheme: 'light', platform: 'web', locale: 'en-US' };

const FIXTURES = fs
    .readdirSync(FIXTURES_DIR, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.ts'))
    .sort()
    .map((file) => {
        const id = file.replace(/\\/g, '/').replace(/\.ts$/, '');
        const source = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8');
        const { outputText } = ts.transpileModule(source, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
        });
        return {
            id,
            name: path.basename(id),
            js: outputText.replace(/export\s+default\s+/g, 'exports.default = '),
        };
    });

// A fresh runtime per render, with every fixture registered (they call each
// other by name), so results don't depend on test order or leftover state.
function createRuntime(errors) {
    const runtime = new BindJSRuntime({
        logger: {
            log() {},
            info() {},
            debug() {},
            warn() {},
            error: (...args) => errors.push(args.map(formatLogArg).join(' ')),
        },
    });
    for (const fixture of FIXTURES) {
        runtime.registerComponent(fixture.name, fixture.js);
    }
    return runtime;
}

function render(name, previewIndex) {
    const errors = [];
    const runtime = createRuntime(errors);
    runtime.willRender();
    runtime.registerEnvironment(ENVIRONMENT);
    runtime.aliasComponent(name, 'Self');

    let ast = null;
    try {
        const result =
            previewIndex === undefined
                ? runtime.callComponent(name, {}, [], false)
                : runtime.callComponentPreview(name, previewIndex, {}, [], false);
        ast = runtime.unwrapComponentAST(result);
        expandForEach(runtime, ast);
    } catch (error) {
        errors.push(`thrown: ${formatLogArg(error)}`);
    }
    return { errors, ast };
}

// Mirrors packages/react/src/Renderer/ui/Views/ForEach.tsx: restore the data
// and environment, then call the item function per element with its index set.
// Items are expanded before descending into them, as React renders them.
function expandForEach(runtime, node) {
    if (Array.isArray(node)) {
        node.forEach((child) => expandForEach(runtime, child));
        return;
    }
    if (node === null || typeof node !== 'object') return;

    if (node.type === 'ForEach' && node.props?.functionId) {
        const { dataId, functionId, environmentId } = node.props;
        const data = runtime.restoreData(dataId) ?? [];
        if (environmentId) runtime.restoreEnvironment(environmentId);

        node.props.$items = data.map((item, index) => {
            runtime.setForEachElementId(index);
            return runtime.callForEachFunction(functionId, item, index);
        });
        runtime.setForEachElementId(null);
    }

    for (const value of Object.values(node)) {
        expandForEach(runtime, value);
    }
}

function renderAll(fixture) {
    const errors = [];
    const previews = createRuntime(errors).getComponentPreviewsWithMetadata(fixture.name) ?? [];

    return [
        { render: 'body', ...render(fixture.name) },
        ...previews.map((preview, i) => ({
            render: `preview ${i}: ${preview.title.trim()}`,
            ...render(fixture.name, i),
        })),
    ];
}

// JSON drops functions and turns Infinity into null; keep both visible so a
// change from `maxWidth: Infinity` to something else still shows up.
function serialize(value) {
    return JSON.stringify(
        value,
        (_key, v) => {
            if (typeof v === 'function') return '[Function]';
            if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
            return v;
        },
        2,
    ) + '\n';
}

function formatLogArg(arg) {
    if (arg instanceof Error) return arg.message;
    if (typeof arg === 'string') return arg;
    try {
        return JSON.stringify(arg);
    } catch {
        return String(arg);
    }
}

describe('fixture AST snapshots', () => {
    it('finds the fixtures', () => {
        expect(FIXTURES.length).toBeGreaterThan(0);
    });

    for (const fixture of FIXTURES) {
        it(fixture.id, async () => {
            const output = serialize({ fixture: fixture.id, renders: renderAll(fixture) });

            // A fixture whose output changes between identical renders would make
            // its snapshot flaky; fail on that directly rather than on the snapshot.
            expect(serialize({ fixture: fixture.id, renders: renderAll(fixture) }), 'render is not deterministic').toBe(output);

            await expect(output).toMatchFileSnapshot(path.join(SNAPSHOT_DIR, `${fixture.id}.json`));
        });
    }
});
