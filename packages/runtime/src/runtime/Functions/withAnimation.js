export function withAnimation(arg1, arg2) {
    let [component, callback] = (arg1 != null && arg2 != null) ? [arg1, arg2] : [{}, arg1]

    let options = {}
    if (typeof component === 'function' && component._component) {
        let componentAST = component()
        options = {
            type: componentAST.type,
            ...componentAST.props
        }
        delete options.children
    } else if (typeof component === 'object') {
        options = component
    }

    let handlerId = this.storeFunction(callback, this.currentPathId('withAnimation'))
    if (this.withAnimation) {
        this.withAnimation(handlerId, options)
    } else {
        console.warn('withAnimation is not supported in this environment')
    }
}