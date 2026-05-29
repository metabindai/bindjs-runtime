import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('Button component', () => {
    let runtime;
    let Button;
    let Text;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Button = runtime.getComponent('Button');
        Text = runtime.getComponent('Text');
    });

    function getButtonLabel(ast) {
        return ast.props && ast.props.label;
    }

    it('creates a Button with {action, label} object', () => {
        const action = vi.fn();
        const component = runtime.defineComponent({
            body: () => Button({ label: 'Save', action })
        })
        const ast = runtime.invokeComponent(component).props.children[0];

        expect(ast.type).toBe('Button');
        expect(typeof ast.props.handlerId).toBe('string');
        expect(runtime.storedFunctions[ast.props.handlerId]).toBe(action);
        const labelAst = getButtonLabel(ast);
        expect(labelAst.type).toBe('Text');
        expect(labelAst.props.rawValue).toBe('Save');
    });

    it('creates a Button with (label: string, action)', () => {
        const action = vi.fn();
        const component = runtime.defineComponent({
            body: () => Button('Delete', action)
        })
        const ast = runtime.invokeComponent(component).props.children[0];

        expect(ast.type).toBe('Button');
        expect(typeof ast.props.handlerId).toBe('string');
        expect(runtime.storedFunctions[ast.props.handlerId]).toBe(action);
        const labelAst = getButtonLabel(ast);
        expect(labelAst.type).toBe('Text');
        expect(labelAst.props.rawValue).toBe('Delete');
    });

    it('creates a Button with (label: Component, action)', () => {
        const action = vi.fn();
        const component = runtime.defineComponent({
            body: () => {
                const labelComponent = () => Text('DynamicLabel')
                return Button(labelComponent, action)
            }
        })
        const ast = runtime.invokeComponent(component).props.children[0];
        expect(ast.type).toBe('Button');
        expect(typeof ast.props.handlerId).toBe('string');
        expect(runtime.storedFunctions[ast.props.handlerId]).toBe(action);

        const labelFn = getButtonLabel(ast);
        expect(typeof labelFn).toBe('function');

        const labelComponent = labelFn();
        const labelAst = runtime.invokeComponent(labelComponent);
        expect(labelAst.type).toBe('Text');
        expect(labelAst.props.rawValue).toBe('DynamicLabel');
    });

    it('throws for Button(label: string) with no action', () => {
        const component = runtime.defineComponent({
            body: () => Button('Click me')
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('throws for Button() with no arguments', () => {
        const component = runtime.defineComponent({
            body: () => Button()
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('throws for Button({ label: "Save" }) with no action', () => {
        const component = runtime.defineComponent({
            body: () => Button({ label: 'Save' })
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('throws for Button({ action: fn }) with no label', () => {
        const action = vi.fn();
        const component = runtime.defineComponent({
            body: () => Button({ action })
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('throws for Button([label, action]) array form', () => {
        const action = vi.fn();
        const component = runtime.defineComponent({
            body: () => Button(['Label', action])
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('throws for Button({ label, action }) with non-function action', () => {
        const component = runtime.defineComponent({
            body: () => Button({ label: 'Save', action: 123 })
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('throws for Button(label: string, action: non-function)', () => {
        const component = runtime.defineComponent({
            body: () => Button('Label', 123)
        })
        expect(() => runtime.invokeComponent(component)).toThrow();
    });

    it('always sets label and action in props for all allowed forms', () => {
        const action = vi.fn();

        // Form 1
        let component = runtime.defineComponent({
            body: () => Button({ label: 'Save', action })
        })
        let ast = runtime.invokeComponent(component).props.children[0];
        expect(ast.props.label.type).toBe('Text');
        expect(ast.props.label.props.rawValue).toBe('Save');
        expect(typeof ast.props.handlerId).toBe('string');
        expect(runtime.storedFunctions[ast.props.handlerId]).toBe(action);

        // Form 2
        component = runtime.defineComponent({
            body: () => Button('Delete', action)
        })
        ast = runtime.invokeComponent(component).props.children[0];
        expect(ast.props.label.type).toBe('Text');
        expect(ast.props.label.props.rawValue).toBe('Delete');
        expect(typeof ast.props.handlerId).toBe('string');
        expect(runtime.storedFunctions[ast.props.handlerId]).toBe(action);

        // Form 3
        component = runtime.defineComponent({
            body: () => {
                const labelComponent = Text('DynamicLabel').opacity(0.5)
                return Button(labelComponent, action)
            }
        })
        ast = runtime.invokeComponent(component).props.children[0];
        expect(typeof ast.props.label).toBe('object');
        const labelAst = ast.props.label;
        expect(labelAst.type).toBe('ModifiedComponent');
        const innerText = labelAst.props.content[0];
        expect(innerText.type).toBe('Text');
        expect(innerText.props.rawValue).toBe('DynamicLabel');
        expect(typeof ast.props.handlerId).toBe('string');
        expect(runtime.storedFunctions[ast.props.handlerId]).toBe(action);
    });
});
