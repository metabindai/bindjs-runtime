export function AnimationModifier({ args,  name, content }) {

    const value = args[0];
    
    // Add the value directly to the props of the content
    const props = content.props;
    props[name] = value;
    
    // Return the AnimationComponent directly to squash the modifier.
    return { ast: content }
}