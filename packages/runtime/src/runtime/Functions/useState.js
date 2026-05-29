export function useState(initialValue) {
    
    // Sanity check
    if (this.hookState.currentComponent == null) {
        return [initialValue, () => {}]
    }

    // Get current state
    var hooks = this.hookState.currentComponent.hookStorage ?? []
    const hookIndex = this.hookState.currentComponent.hookIndex

    //console.log(`useState index ${currentHook} value ${hooks[currentHook]} initialValue ${initialValue}`);
    
    // Initialise hook with initialValue if needed
    hooks[hookIndex] = hooks[hookIndex] == null ? initialValue : hooks[hookIndex]

    const rerenderCallback = this.needsRerender
    const rendererId = this.rendererId

    // Create setState callback
    let callback = (value) => {

        //console.log(`useState callback value [${value}]`)

        // Update state
        hooks[hookIndex] = value                

        // Trigger a re-render is required due to state changing
        rerenderCallback(rendererId)
        return value                
    }

    return [hooks[this.hookState.currentComponent.hookIndex++], callback]    
}