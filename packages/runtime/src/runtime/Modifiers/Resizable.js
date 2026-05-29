export function Resizable({ args, content }) {

    const resizable = args[0];

    if (content && content.type === 'Image') {

        // If the content is a Image component, we need to modify its prop directly
        const imageProps = content.props;
        imageProps.resizable = resizable == false ? false : true ;

        // Return the Image directly
        return { ast: content }

    } else {
        return { 
            props: { rawValue: resizable },
            children: content
        }
    }
}