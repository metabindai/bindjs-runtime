import { StyleProvider, useStyle } from '../Style';
import { useRendererContext } from '../../RendererContext';    
import { Variables , useVariables} from '../Variable';

import { layoutRegistry , LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';

export function TextField({ textFieldStyle, text, prompt, children }) {
    const layout = useLayout({}, TextField);

    const style = {
        // Apply environment style.
        ...useStyle(),
    
        // Apply layout positioning css
        ...layoutStyle(layout)
    }

    const rendererContext = useRendererContext();

    /** Get variables and functions */
    const { variables } = useVariables();

    var ts = textFieldStyle;

    if (ts && rendererContext.viewCallback ) {
        let label = <TextFieldLabel prompt={prompt}/>
        let textFieldStyleView = rendererContext.viewCallback(ts, { label: { type: 'Variable', name: 'configuration.label' }} );

        if (textFieldStyleView) {
            let props = {
                'configuration.label': <TextFieldLabel prompt={prompt}/>
            }
            
            style['textAlign'] = style['textAlign'] || 'center'

            return <Variables {...props} {...style}><StyleProvider style={style}>{textFieldStyleView}</StyleProvider></Variables>
        }
    } 
    return (
        <input type="textfield" style={style}></input>
    );
}

function TextFieldLabel({ prompt } : { prompt?: string }) {
    const style = {
        border: "0px",
        background: "transparent",
        width: '100%',
        ...useStyle(),
    }
    return (<input type="textfield" placeholder={prompt} style={style}></input>);
}

// Size calculation function
const sizeThatFits = ({ proposal, props, children }) : LayoutMeasurement => {
    return {
        frame: proposal
    };  
}

layoutRegistry.register(
    TextField,
    sizeThatFits
);
