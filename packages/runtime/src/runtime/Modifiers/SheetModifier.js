export function SheetModifier({ args, name }) {

    // Assume args[0] contains the props
    const props = args[0] ?? { isPresented: false };

    // processProps has already stored the set…/on… callbacks under their …Id
    // names (setIsPresentedId, onDismissId); map them to the …HandlerId names
    // the renderers read.
    const content = props.content

    // Return AST representation when content handler is called.
    const contentHandler = content ? () => {
        // Execute handler, then AST function.
        return content()();
    } : () => {
        return null;
    };

    return {
        props: {
            isPresented: props.isPresented,
            setIsPresentedHandlerId: props.setIsPresentedId ?? null,
            dismissHandlerId: props.onDismissId ?? null,
            contentHandlerId: this.storeFunction(contentHandler, this.currentPathId(name + '_content')),
        }
    }
}
