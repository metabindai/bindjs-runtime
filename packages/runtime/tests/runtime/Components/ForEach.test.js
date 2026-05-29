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
