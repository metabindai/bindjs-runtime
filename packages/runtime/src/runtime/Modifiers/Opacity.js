export function Opacity({ args, content }) {

    const opacity = args[0];

    if (content && content.type === 'Color') {

        // If the content is a Color component, we need to modify its opacity
        const colorProps = content.props;
        if (colorProps && colorProps.a !== undefined) {
            // If the color already has an alpha value, we can just multiply it
            colorProps.a *= opacity;
        } else {
            // Otherwise, we set the alpha value to the first argument
            colorProps.opacity = colorProps.opacity ? colorProps.opacity * opacity : opacity;
        }

        // Return the Color directly
        return { ast: content }

    } else if (content && content.type === 'ModifiedComponent' && content.props?.modifier?.type === 'opacity') {

        // Collapse opacity modifiers
        content.props.modifier.props.rawValue *= opacity;
        return { ast: content }

    } else {

        // If the content is not a Color component, we just return it as is
        // but we can still apply the opacity to the parent element
        return {
            props: { rawValue: opacity },
            children: content
        }
    }
}