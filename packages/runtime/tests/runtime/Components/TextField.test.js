import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('TextField component', () => {
    let runtime;
    let TextField;
    let SecureField;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        TextField = runtime.getComponent('TextField');
        SecureField = runtime.getComponent('SecureField');
    });

    it('serializes placeholder, text and setText as setTextId', () => {
        const setText = vi.fn();
        const component = runtime.defineComponent({
            body: () => TextField({ placeholder: 'Your name', text: 'Dave', setText })
        })
        const ast = runtime.invokeComponent(component).props.children[0];

        expect(ast.type).toBe('TextField');
        expect(ast.props.placeholder).toBe('Your name');
        expect(ast.props.text).toBe('Dave');
        expect(ast.props.setText).toBeUndefined();
        expect(typeof ast.props.setTextId).toBe('string');
        expect(runtime.storedFunctions[ast.props.setTextId]).toBe(setText);
    });

    it('serializes SecureField the same way', () => {
        const setText = vi.fn();
        const component = runtime.defineComponent({
            body: () => SecureField({ placeholder: 'Password', text: '', setText })
        })
        const ast = runtime.invokeComponent(component).props.children[0];

        expect(ast.type).toBe('SecureField');
        expect(ast.props.placeholder).toBe('Password');
        expect(typeof ast.props.setTextId).toBe('string');
        expect(runtime.storedFunctions[ast.props.setTextId]).toBe(setText);
    });
});
