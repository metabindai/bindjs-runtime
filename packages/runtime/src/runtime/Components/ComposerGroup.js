import { processChildren } from './GenericComponent.js';

export function ComposerGroup({ args, name }) {
    const props = { };

    const env = this.environment;
    var children = null;

    if (args) {
        if (args[0] && args[1] || (typeof args[0] === 'object' && !Array.isArray(args[0])) || typeof args[0] === 'string') {
            // If the first argument is an object, treat it as props
            if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
                Object.assign(props, args[0]);

            } else if (typeof args[0] === 'string') {
                // Otherwise, treat the first argument as a raw value
                props.rawValue = args[0];
            }

            if (args[1]) {
                children = args[1];
            }

        } else if (args[0]) {
            // If the first argument is an array, treat it as children
            children = args[0] ?? [];
        }
    }

    if (!children) {
        let propName = props.property || props.rawValue || props.group;
        if (propName == 'children') {
            children = env?.content?.children || [];   
        } else {
            children = env?.content?.layoutProps?.[props.rawValue ?? props.property] || []
        }
    }

    const childrenAST = processChildren.bind(this)(children).filter(child => {
        return true
        // const groupName = props.group || props.rawValue;

        // const childGroupName = child?.props?.group;

        // if (!groupName && !childGroupName) {
        //     return true
        // }

        // return (childGroupName === groupName) 
    });   

    
    const result = {
        props: this.processProps(props),
        children: childrenAST
    }
    
    return result;
}