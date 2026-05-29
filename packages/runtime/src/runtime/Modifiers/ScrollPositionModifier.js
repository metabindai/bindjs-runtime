export function ScrollPositionModifier({ args, name }) {
    const props = args[0] ?? {};
    const path = this.currentPathId(name);
    const environmentId = this.storeEnvironment(path);

    const result = { scrolledID: props.id ?? null, environmentId };

    if (typeof props.setId === 'function') {
        result.setScrolledIDHandlerId = this.storeFunction(props.setId, path);
    } else if (props.setIdId) {
        result.setScrolledIDHandlerId = props.setIdId;
    }

    return { props: result };
}
