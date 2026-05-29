export function CallbackComponent({ args, name }) {
    const callback = args[0];

    if (!callback || typeof callback !== 'function') {
        return { props: { handlerId: null } };
    }

    // Wrap the callback to unwrap component functions
    const handler = (geometry) => this.unwrapComponentAST(callback(geometry));

    const id = this.currentPathId('CallbackComponent_' + name);
    const handlerId = this.storeFunction(handler, id);
    const environmentId = this.storeEnvironment(id);

    return { props: { handlerId, environmentId } };
}
