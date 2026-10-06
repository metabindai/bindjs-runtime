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

describe('ForEach hook paths', () => {
    // Three rows, each with a hook of its own and two leaves with one each, then a leaf
    // after the loop. Every leaf starts from a distinct value, so a leaf that shares
    // another's hook array shows the other's value.
    const components = {
        Leaf: `exports.default = defineComponent({ body: (props) => { const [value] = useState(props.initial); return Text(String(value)) } })`,
        Row: `exports.default = defineComponent({ body: (props) => { const [row] = useState(props.row); return VStack([Leaf({ initial: row * 10 + 1 }), Leaf({ initial: row * 10 + 2 })]) } })`,
        List: `exports.default = defineComponent({ body: () => VStack([ForEach([0, 1, 2], (row) => Row({ row })), Leaf({ initial: 99 })]) })`,
    };

    function texts(node, out = []) {
        if (Array.isArray(node)) node.forEach((child) => texts(child, out));
        else if (node && typeof node === 'object') {
            if (node.type === 'Text') out.push(node.props.rawValue);
            Object.values(node.props ?? {}).forEach((value) => texts(value, out));
        }
        return out;
    }

    function render(runtime) {
        runtime.willRender();
        return texts(runtime.callComponent('List', {}, []));
    }

    it('gives every row, and every leaf in a row, its own state', () => {
        const runtime = new BindJSRuntime({ expandForEach: true });
        runtime.registerComponents(components);
        const expected = ['1', '2', '11', '12', '21', '22', '99'];
        expect(render(runtime)).toEqual(expected);
        // And the same paths on the next render.
        expect(render(runtime)).toEqual(expected);
    });

    it('addresses row 0 like the other rows', () => {
        const runtime = new BindJSRuntime({ expandForEach: true });
        runtime.registerComponents(components);
        render(runtime);
        // Row roots are keyed by the bare element index: List_0.VStack_0.ForEach_0.<index>.
        const rowRoots = Object.keys(runtime.hookState.componentHookStore).filter((path) => /\.ForEach_0\.[^.]+$/.test(path));
        expect(rowRoots.map((path) => path.split('.').pop()).sort()).toEqual(['0', '1', '2']);
    });

    it('does not lend the last row index to a view built after the loop', () => {
        const runtime = new BindJSRuntime({ expandForEach: true });
        runtime.registerComponents({
            Plain: `exports.default = defineComponent({ body: () => VStack([ForEach([0, 1], (i) => Text(String(i))), Leaf({ initial: 7 })]) })`,
            Leaf: components.Leaf,
        });
        runtime.willRender();
        expect(texts(runtime.callComponent('Plain', {}, []))).toEqual(['0', '1', '7']);
        expect(runtime.hookState.forEachElementId).toBeNull();
    });
});

describe('restoreEnvironmentOnly', () => {
    it('restores the stored environment and leaves the hook path alone', () => {
        const runtime = new BindJSRuntime({ expandForEach: true });
        runtime.environment = { colorScheme: 'dark' };
        const id = runtime.storeEnvironment('stored');
        runtime.environment = { colorScheme: 'light' };
        runtime.hookState.path = ['current'];
        runtime.restoreEnvironmentOnly(id);
        expect(runtime.environment).toEqual({ colorScheme: 'dark' });
        expect(runtime.hookState.path).toEqual(['current']);
    });
});
