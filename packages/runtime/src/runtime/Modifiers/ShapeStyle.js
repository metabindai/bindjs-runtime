// Normalise .fill modifier and pass into to the component it's applied to as a prop
// fill: { style: ShapeStyle }
export function Fill({ args, content }) {

    const style = args[0];

    // If the content is a Color component, we need to modify its opacity
    const shapeProps = content.props;

    // If passing { style: Color('red') } etc , then pass dictionary directly
    if (typeof style === 'object' && style.style != null) {
        shapeProps.fill = this.processProps({ ...style });

    // Otherwise if the value is the style itself e.g. Color('red') or 'red', then setup the fill property
    } else if (typeof style === 'function') {
        shapeProps.fill = this.processProps({ style: style });
    }

    // Return the Color directly
    return { ast: content }
}

// Normalise .stroke modifier and pass into to the component it's applied to as a prop
// stroke: { style: ShapeStyle, lineWidth: number }
export function Stroke({ args, content }) {

    const style = args[0];

    // If the content is a Color component, we need to modify its opacity
    const shapeProps = content.props;

    // If passing { style: Color('red') } etc , then pass dictionary directly
    if (typeof style === 'object' && style.style != null) {
        shapeProps.stroke = this.processProps({ ...style });

    // Otherwise if the value is the style itself e.g. Color('red') or 'red', then setup the fill property
    } else if (typeof style === 'function') {
        shapeProps.stroke = this.processProps({ style: style });
    } else if (typeof style === 'number') {
        shapeProps.stroke = { lineWidth: style }
    }
    
    // Return the Color directly
    return { ast: content }
}