export function EnvironmentValue({ args }) {
    const props = { environmentKey: args[0], value: args[1] }
    return { props }
}

EnvironmentValue.environmentValue = (name, args) => {
    return { key: args[0], value: args[1] } 
}