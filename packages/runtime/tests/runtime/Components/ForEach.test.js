import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('ForEach component', () => {
    let runtime, ForEach, Text;
    beforeEach(() => {
        runtime = new BindJSRuntime({ expandForEach: true });
        runtime.registerBuiltInComponents();
        ForEach = runtime.getComponent('ForEach');
        Text = runtime.getComponent('Text');
    });

    it('expands children for each element in the array', () => {
        const data = [1, 2, 3];
        const callback = (item) => Text({ rawValue: item });

        const component = runtime.defineComponent({
            body: () => (
                ForEach(data, callback)
            )
        })

        const wrapperAst = runtime.invokeComponent(component);
        const ast = wrapperAst.props.children[0];

        expect(ast.type).toBe('ForEach');
        expect(ast.props.children).toHaveLength(data.length);
        expect(ast.props.children.map(child => child.props.rawValue)).toEqual([1, 2, 3]);
    });
});

// Each mode as a renderer drives it: MCP hosts expand rows in the runtime, Studio's
// preview and the native renderers build them lazily, one callForEachFunction per row.
describe.each([['expanded', true], ['lazy', false]])('ForEach hook paths (%s)', (_, expandForEach) => {
    // Three rows, each with a hook of its own and two leaves with one each, then a leaf
    // after the loop. Every leaf starts from a distinct value, so a leaf that shares
    // another's hook array shows the other's value.
    const components = {
        Leaf: `exports.default = defineComponent({ body: (props) => { const [value, set] = useState(props.initial); globalThis.forEachSetters[props.initial] = set; return Text(String(value)) } })`,
        Row: `exports.default = defineComponent({ body: (props) => { const [row] = useState(props.row); return VStack([Leaf({ initial: row * 10 + 1 }), Leaf({ initial: row * 10 + 2 })]) } })`,
        List: `exports.default = defineComponent({ body: () => VStack([ForEach([0, 1, 2], (row) => Row({ row })), Leaf({ initial: 99 })]) })`,
    };

    beforeEach(() => {
        globalThis.forEachSetters = {};
    });

    // The rows of a lazy ForEach, built as the renderers build them.
    function lazyRows(runtime, { dataId, functionId, environmentId }) {
        const data = runtime.restoreData(dataId);
        runtime.restoreEnvironment(environmentId);
        const rows = data.map((element, index) => {
            runtime.setForEachElementId(index);
            return runtime.callForEachFunction(functionId, element, index);
        });
        runtime.setForEachElementId(null);
        return rows;
    }

    function texts(runtime, node, out = []) {
        if (Array.isArray(node)) node.forEach((child) => texts(runtime, child, out));
        else if (node && typeof node === 'object') {
            if (node.type === 'Text') out.push(node.props.rawValue);
            if (node.type === 'ForEach' && node.props.functionId) texts(runtime, lazyRows(runtime, node.props), out);
            Object.values(node.props ?? {}).forEach((value) => texts(runtime, value, out));
        }
        return out;
    }

    function make(registered) {
        const runtime = new BindJSRuntime({ expandForEach });
        runtime.registerComponents(registered);
        return runtime;
    }

    function render(runtime, name = 'List', props = {}) {
        runtime.willRender();
        return texts(runtime, runtime.callComponent(name, props, []));
    }

    it('gives every row, and every leaf in a row, its own state', () => {
        const runtime = make(components);
        const expected = ['99', '1', '2', '11', '12', '21', '22'];
        expect(render(runtime).sort()).toEqual(expected.sort());
        // And the same paths on the next render.
        expect(render(runtime).sort()).toEqual(expected.sort());
    });

    it('builds each row under its index, row 0 included', () => {
        const runtime = make(components);
        render(runtime);
        const rowRoots = Object.keys(runtime.hookState.componentHookStore).filter((path) => path.endsWith('.Row_0'));
        expect(rowRoots.map((path) => path.split('.').at(-2)).sort()).toEqual(['0', '1', '2']);
    });

    it('starts a row fresh when its view changes type', () => {
        // Row 0's view goes from A (a number) to B (a string). Sharing A's hooks, B
        // would call toUpperCase on 11 and throw.
        const runtime = make({
            A: `exports.default = defineComponent({ body: () => { const [value] = useState(11); return Text(String(value)) } })`,
            B: `exports.default = defineComponent({ body: () => { const [value] = useState('abc'); return Text(value.toUpperCase()) } })`,
            Switch: `exports.default = defineComponent({ body: (props) => VStack([ForEach([0], () => props.which ? B() : A())]) })`,
        });
        expect(render(runtime, 'Switch', { which: false })).toEqual(['11']);
        expect(render(runtime, 'Switch', { which: true })).toEqual(['ABC']);
    });

    it('gives an overlay in a row state of its own', () => {
        const runtime = make({
            Leaf: components.Leaf,
            Overlaid: `exports.default = defineComponent({ body: () => VStack([ForEach([0, 1], (row) => Leaf({ initial: row * 10 + 1 }).overlay(Leaf({ initial: row * 10 + 2 })))]) })`,
        });
        expect(render(runtime, 'Overlaid').sort()).toEqual(['1', '11', '12', '2']);
        // Setting the overlay's state leaves the content's alone.
        globalThis.forEachSetters[2](99);
        expect(render(runtime, 'Overlaid').sort()).toEqual(['1', '11', '12', '99']);
    });

    it('gives each row its own handlers', () => {
        // On main every row's onTapGesture had one id, so a tap on any row ran the last row's.
        const runtime = make({
            Taps: `exports.default = defineComponent({ body: () => VStack([ForEach([0, 1, 2], (row) => Text(String(row)).onTapGesture(() => globalThis.forEachSetters.tapped.push(row)))]) })`,
        });
        globalThis.forEachSetters.tapped = [];
        const handlerIds = [];
        const collect = (node) => {
            if (Array.isArray(node)) node.forEach(collect);
            else if (node && typeof node === 'object') {
                if (node.type === 'ForEach' && node.props.functionId) collect(lazyRows(runtime, node.props));
                if (node.props?.handlerId) handlerIds.push(node.props.handlerId);
                Object.values(node.props ?? {}).forEach(collect);
            }
        };
        runtime.willRender();
        collect(runtime.callComponent('Taps', {}, []));
        expect(new Set(handlerIds).size).toBe(3);
        handlerIds.forEach((id) => runtime.restoreFunction(id)());
        expect(globalThis.forEachSetters.tapped).toEqual([0, 1, 2]);
    });

    it('keeps a view after the loop on its own path as rows are added', () => {
        // Rows that are plain AST rather than components, then a leaf whose state is
        // edited. Adding a row must leave the leaf's state where it was.
        const runtime = make({
            Leaf: components.Leaf,
            Plain: `exports.default = defineComponent({ body: (props) => VStack([ForEach(props.rows, (i) => ({ type: 'Text', props: { rawValue: String(i) } })), Leaf({ initial: 7 })]) })`,
        });
        expect(render(runtime, 'Plain', { rows: [0, 1] })).toEqual(['0', '1', '7']);
        globalThis.forEachSetters[7](999);
        expect(render(runtime, 'Plain', { rows: [0, 1, 2] })).toEqual(['0', '1', '2', '999']);
        expect(runtime.hookState.forEachElementId).toBeNull();
    });
});
