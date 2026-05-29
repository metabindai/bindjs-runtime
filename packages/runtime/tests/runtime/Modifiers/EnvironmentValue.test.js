import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('environment value modifier', () => {
    let runtime, Text;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Text = runtime.getComponent('Text');
    });

    function getEnvironmentModifierPropsFromComponent(key, value) {
        const component = runtime.defineComponent({
            body: () => (
                Text({ rawValue: 'Hello World' })
                    .environment(key, value)
            )
        })
        return runtime.invokeComponent(component).props.children[0].props.modifier.props;
    }

    it('sets the environment key and value in the modifier props', () => {
        expect(getEnvironmentModifierPropsFromComponent('colorScheme', 'dark')).toMatchObject({
            environmentKey: 'colorScheme',
            value: 'dark',
        });
    });

    it('works with numeric values', () => {
        expect(getEnvironmentModifierPropsFromComponent('displayScale', 2)).toMatchObject({
            environmentKey: 'displayScale',
            value: 2,
        });
    });
});
