export function AnimationComponent({ args, name }) {
    const typeMap = {
        'Spring': 'spring',
        'EaseIn': 'easeIn',
        'EaseOut': 'easeOut',
        'EaseInOut': 'easeInOut',
        'Linear': 'linear',
        'Bouncy': 'bouncy',
        'Snappy': 'snappy',
        'InterpolatingSpring': 'interpolatingSpring',
    }

    const props = {
        type: typeMap[name] ?? 'unknown',
        ...(args[0] ?? {})
    }

    return { props }
}