import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('TextEditor component', () => {
    let runtime;
    let TextEditor;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        TextEditor = runtime.getComponent('TextEditor');
    });

    it('serializes text and setText as setTextId', () => {
        const setText = vi.fn();
        const component = runtime.defineComponent({
            body: () => TextEditor({ text: 'Notes', setText })
        })
        const ast = runtime.invokeComponent(component).props.children[0];

        expect(ast.type).toBe('TextEditor');
        expect(ast.props.text).toBe('Notes');
        expect(ast.props.setText).toBeUndefined();
        expect(typeof ast.props.setTextId).toBe('string');
        expect(runtime.storedFunctions[ast.props.setTextId]).toBe(setText);
    });
});
