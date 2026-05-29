import AST from '../AST.js'

export function Button({ args }) {
    const [arg1, arg2] = args;

    // Normalize into { action, label }
    // If a single arg is passed and it's an object, use it as { action, label }
    // If two args are passed, use the first as label and the second as action
    var { action, label } = typeof arg1 === 'object' && Object.keys(arg1).length > 0
        ? arg1
        : { label: arg1, action: arg2 };

    if (!label) {
        throw new Error("Button requires a label")
    }

    if (!action || typeof action !== 'function') {
        throw new Error("Button requires an action function")
    }


    // Support label to be a raw string, convert to Text component
    if (typeof label == 'string') {
        label = AST.Directive('Text', { rawValue: label })
    }

    // Store the action, get the handlerId to be provided in the AST props.
    const path = this.currentPathId()
    const handlerId = this.storeFunction(action, path);
    const environmentId = this.storeEnvironment(path);

    // Process label
    const { label: finalLabel } = this.processProps({ label })

    return {
        props: { handlerId, label: finalLabel, environmentId },
        children: []
    }

}
