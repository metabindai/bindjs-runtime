import AST from "../AST.js";
/**
 * convertComponentProps
 * ---------------------
 * Recursively traverses a props object and replaces any "component-like" objects
 * (objects with a `componentId` and `name` field) with the result of calling that component.
 *
 * A "component-like" object is expected to look like:
 * {
 *   componentId: string,
 *   name: string,
 *   props: object
 * }
 *
 * The function assumes `this.call(name, 'body', props)` is available for resolving components.
 * 
 * Efficiency:
 * - Arrays and objects are only cloned if any of their children change.
 * - Component calls are only made when matching shape is detected.
 * - Fast return for primitive types and unchanged structures.
 *
 * @param props - The input props object to convert.
 * @returns A new props object with all components resolved, or the original if unchanged.
 */
export function convertComponentProps(props) {
    if (props == null || typeof props !== 'object') return props;

    const makeComponent = this.makeComponent?.bind(this);
    const getExport = this.getComponentExport?.bind(this);

    function process(item) {

        // Fast-path array
        if (Array.isArray(item)) {
            let changed = false;
            const len = item.length;
            const result = new Array(len);
            for (let i = 0; i < len; i++) {
                const [val, didChange] = process(item[i]);
                if (didChange) changed = true;
                result[i] = val;
            }
            return [changed ? result : item, changed];
        }

        // Fast-path component call
        if (item && typeof item === 'object') {

            // Detect a (possibly partial) component-like shape: anything with a string `_type`
            // that looks like the prefix of "ComponentInstance". Streaming MCP tool calls can
            // deliver partial objects (e.g. {_type: "ComponentInsta"} or a complete _type with
            // no _component yet); without this guard the raw object leaks into React children
            // and triggers "Objects are not valid as a React child".
            if (typeof item._type === 'string' && 'ComponentInstance'.startsWith(item._type)) {

                // Partial — not yet a fully-formed ComponentInstance. Render nothing for now.
                if (item._type !== 'ComponentInstance' || item._component == null || !getExport) {
                    return [null, true];
                }

                // Wrap in makeComponent, so the function is called at runtime (rather than parsing of props time)
                // So environment works correctly.
                const result = makeComponent(() => {
                    let body = getExport(item._component, 'body')

                    // Component name didn't resolve (e.g. streamed-in name not yet a known component).
                    if (typeof body !== 'function') {
                        return null
                    }

                    // Remove the special fields from the item before passing to the component, and process the props to catch any child components.
                    const { _component, _type, _id, ...itemProps } = item;
                    const processedProps = process(itemProps)[0];

                    return body(processedProps)
                })

                return [result, true];
            }

            // Check for component-like structure
            if (item.id != null && item.type && item.props && getExport) {
                let bodyFunc = getExport(item.type, 'body')
                const result = bodyFunc(item.type, item.props)
                //const result = callFn(item.type, item.props);
                return [result, true];
            }

            // Traverse object
            let changed = false;
            let result = null;
            for (const key in item) {
                if (!Object.hasOwn(item, key)) continue;
                const val = item[key];
                const [processed, didChange] = process(val);
                if (didChange) {
                    if (!changed) {
                        changed = true;
                        result = { ...item };  // Lazy copy only when the first change occurs
                    }
                    result[key] = processed;  // Apply the changed value
                }
            }
            return [changed ? result : item, changed];
        }

        // Primitive
        return [item, false];
    }

    return process(props)[0];
}