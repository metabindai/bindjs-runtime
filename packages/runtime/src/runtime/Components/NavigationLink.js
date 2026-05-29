import AST from '../AST.js'

export function NavigationLink({ args }) {
    const [arg1, arg2] = args;

    // Normalize into { destination, label }
    // If a single arg is passed and it's an object, use it as { destination, label }
    // If two args are passed, use the first as label and the second as destination
    var { destination, label } = typeof arg1 === 'object' && Object.keys(arg1).length > 0
        ? arg1
        : { label: arg1, destination: arg2 };

    // Support label as a raw string, convert to Text component
    if (typeof label === 'string') {
        label = AST.Directive('Text', { rawValue: label });
    }

    // Store the destination handler
    const path = this.currentPathId();
    const environmentId = this.storeEnvironment(path);

    // Create destination handler that returns AST when called
    const destinationHandler = destination ? () => {
        return destination()();
    } : () => null;

    const destinationHandlerId = this.storeFunction(destinationHandler, this.currentPathId('NavigationLink_destination'));

    // Process label
    const { label: finalLabel } = this.processProps({ label });

    return {
        props: { destinationHandlerId, label: finalLabel, environmentId },
        children: []
    };
}