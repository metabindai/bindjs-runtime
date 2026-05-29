export function SheetModifier({ args, name }) {

    // Assume args[0] contains the props
    const props = args[0] ?? { isPresented: false };

    // Extract isPresented binding. First arg is the getter, second is the setter
    const isPresented = props.isPresented
    const setIsPresented = props.setIsPresented ?? (() => { });

    // Extract onDismiss handler if provided
    const onDismiss = props.onDismiss;

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
            // Store isPresented binding handlers
            isPresented: isPresented,
            setIsPresentedHandlerId: setIsPresented ? this.storeFunction(setIsPresented, this.currentPathId(name + '_setPresented')) : null,

            // Store content handler
            contentHandlerId: this.storeFunction(contentHandler, this.currentPathId(name + '_content')),

            // Store onDismiss handler if provided
            dismissHandlerId: onDismiss ? this.storeFunction(onDismiss, this.currentPathId(name + '_dismiss')) : null,
        }
    }
}
