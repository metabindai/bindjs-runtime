import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../src/runtime/BindJSRuntime.js';

describe('BindJSRuntime', () => {
    it('can be constructed', () => {
        const runtime = new BindJSRuntime();
        expect(runtime).toBeInstanceOf(BindJSRuntime);
    });

    it('wraps built-in component calls in ComponentCall', () => {
        const runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        const Text = runtime.getComponent('Text');

        const component = runtime.defineComponent({
            body: () => Text('Hello')
        })

        const wrapperAst = runtime.invokeComponent(component);
        expect(wrapperAst.type).toBe('ComponentCall');
        expect(wrapperAst.props.children).toHaveLength(1);
        expect(wrapperAst.props.children[0].type).toBe('Text');
    });

    it('correctly handles component children', () => {
        const runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        const Text = runtime.getComponent('Text');
        const VStack = runtime.getComponent('VStack');

        const component = runtime.defineComponent({
            body: () => VStack([
                Text('Child 1'),
                Text('Child 2')
            ])
        })

        const wrapperAst = runtime.invokeComponent(component);

        const componentCall = wrapperAst;
        expect(componentCall.type).toBe('ComponentCall');
        expect(componentCall.props.children).toHaveLength(1);

        const vstackAst = componentCall.props.children[0];

        expect(vstackAst.type).toBe('VStack');
        expect(vstackAst.props.children).toHaveLength(2);
        expect(vstackAst.props.children[0].type).toBe('Text');
        expect(vstackAst.props.children[0].props.rawValue).toBe('Child 1');
        expect(vstackAst.props.children[1].type).toBe('Text');
        expect(vstackAst.props.children[1].props.rawValue).toBe('Child 2');
    });
});

describe('modifier chaining', () => {
    let runtime, Text;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Text = runtime.getComponent('Text');
    });

    it('applies multiple modifiers in order', () => {
        const component = runtime.defineComponent({
            body: () => (
                Text('content')
                    .padding(4)
                    .environment('colorScheme', 'dark')
            )
        })

        const wrapperAst = runtime.invokeComponent(component);
        const ast = wrapperAst.props.children[0];

        // The outermost modifier should be 'environment'
        expect(ast.props.modifier.type).toBe('environment');
        expect(ast.props.modifier.props).toMatchObject({ environmentKey: 'colorScheme', value: 'dark' });

        // The content should be a ModifiedComponent with the padding modifier
        const inner = ast.props.content[0];
        expect(inner.type).toBe('ModifiedComponent');
        expect(inner.props.modifier.type).toBe('padding');
        expect(inner.props.modifier.props).toMatchObject({ top: 4, leading: 4, bottom: 4, trailing: 4 });
    });
});
