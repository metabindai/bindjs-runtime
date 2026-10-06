import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

// A modifier's view content (an overlay, a background) is a view of its own, with state
// of its own, as in SwiftUI.
describe('modifier content hook paths', () => {
    const Leaf = `exports.default = defineComponent({ body: (props) => { const [value, set] = useState(props.initial); globalThis.contentSetters[props.initial] = set; return Text(String(value)) } })`;

    beforeEach(() => {
        globalThis.contentSetters = {};
    });

    function texts(node, out = []) {
        if (Array.isArray(node)) node.forEach((child) => texts(child, out));
        else if (node && typeof node === 'object') {
            if (node.type === 'Text') out.push(node.props.rawValue);
            Object.values(node.props ?? {}).forEach((value) => texts(value, out));
        }
        return out;
    }

    function render(body) {
        const runtime = new BindJSRuntime({ expandForEach: true });
        runtime.registerComponents({ Leaf, View: `exports.default = defineComponent({ body: () => ${body} })` });
        return () => {
            runtime.willRender();
            return texts(runtime.callComponent('View', {}, [])).sort();
        };
    }

    it('gives an overlay of the same component as its view state of its own', () => {
        const draw = render(`VStack([Leaf({ initial: 1 }).overlay(Leaf({ initial: 2 }))])`);
        expect(draw()).toEqual(['1', '2']);
        globalThis.contentSetters[2](20);
        expect(draw()).toEqual(['1', '20']);
    });

    it('tells apart two overlays on one view, and the overlays of sibling views', () => {
        const draw = render(`VStack([
            Leaf({ initial: 1 }).overlay(Leaf({ initial: 2 })).overlay(Leaf({ initial: 3 })),
            Leaf({ initial: 4 }).overlay(Leaf({ initial: 5 })).background(Leaf({ initial: 6 })),
        ])`);
        expect(draw()).toEqual(['1', '2', '3', '4', '5', '6']);
        expect(draw()).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('tells apart the views in an overlay holding several', () => {
        const draw = render(`VStack([Text('base').overlay([Leaf({ initial: 1 }), Leaf({ initial: 2 })])])`);
        expect(draw()).toEqual(['1', '2', 'base']);
    });
});
