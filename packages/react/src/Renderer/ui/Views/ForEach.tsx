import type React from 'react';
import { useRendererContext } from '../../RendererContext';

// A lazy ForEach's items, by the props object of its decoded element: built
// once and shared by the layout pass (an ancestor measuring them) and the
// render, so the item builders run once per decode.
const expansions = new WeakMap<object, React.ReactNode>();

/**
 * The items of a ForEach. An expanded one (expandForEach) carries them as
 * children; a lazy one builds them from the runtime's stored data and item
 * function.
 */
export function expandForEach(props: Record<string, any>, rendererContext: any): React.ReactNode {
    if (props.children) return props.children;
    if (expansions.has(props)) return expansions.get(props);
    if (!rendererContext) return null;

    const { dataId, functionId, environmentId } = props;

    // Restore data
    let data = rendererContext.dataCallback(dataId);

    // Restore environment
    rendererContext.restoreEnvironmentCallback(environmentId);

    if (data == null) { return "no data" }

    let content = data.map((item, index) => {
        rendererContext.setForEachId(index)

        try {
            let ast = rendererContext.forEachCallback(functionId, item, index)
            let decode = rendererContext.decodeViewCallback(ast)
            return decode
        } catch (e) {
            console.log(e)
            return null
        }
    })

    rendererContext.setForEachId(null)

    expansions.set(props, content);
    return content
}

export function ForEach(props) {
    const rendererContext = useRendererContext();
    return expandForEach(props, rendererContext);
}
