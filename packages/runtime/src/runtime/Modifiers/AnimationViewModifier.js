export function AnimationViewModifier({ args, name }) {
    var { animation: animArg, value } = args[0] ?? {}

    var animation = null
    if (typeof animArg === 'function' && animArg._component) {
        var ast = animArg()
        animation = { type: ast.type, ...ast.props }
        delete animation.children
    } else if (animArg && typeof animArg === 'object') {
        animation = animArg
    }

    return {
        props: {
            animation: animation ? JSON.stringify(animation) : null,
            value: value != null ? String(value) : null
        }
    }
}
