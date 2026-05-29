var modifierDefaults = {
    'disabled': true
}


// Add all environment value modifiers that need to be accessible in the environment
var modifiersToAddToEnvironment = [
    // Existing modifiers
    'padding',
    'textSelection',
    'font',
    'foregroundStyle',
    'accentColor',
    'controlSize',
    'multilineTextAlignment',
    'lineSpacing',
    'textCase',
    'lineLimit',
    'imageScale',
    'colorScheme',
    'environment',
    
    // EnvironmentValues from Environment.tsx
    'displayScale',
    'dynamicTypeSize',
    'locale',
    'layoutDirection',
    'screen',
    'platform'
]

export function GenericModifier({ args, name }) {

    var props = args[0] == null ? modifierDefaults[name] : args[0]

    // Handle passing single value
    if (Array.isArray(props) || typeof props != 'object' || (typeof props == 'object' && props.type != null)) { 
        if (typeof props == 'function') {
            props = props()
        }
        props = { rawValue: props }
    }

    return { props }
}

GenericModifier.environmentValue = (name, args) => {
    if (!modifiersToAddToEnvironment.includes(name)) {
        return null
    }
    return { key: name, value: args[0] }
}