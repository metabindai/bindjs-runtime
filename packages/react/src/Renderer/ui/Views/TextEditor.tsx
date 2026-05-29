import { StyleProvider, useStyle } from '../Style';
import { layoutRegistry , LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';

export function TextEditor({ text }) {
    const layout = useLayout({}, TextEditor);

    const style = {
        // Apply environment style.
        ...useStyle(),
    
        // Apply layout positioning css
        ...layoutStyle(layout)
    }

    style['width'] = '100%';
    style['height'] = '100%';

    // Remove default border if not specified
    if (style.borderWidth === undefined && style.border === undefined) {
        style['border'] = '0px';
    }

    return <textarea style={style} value={text} readOnly></textarea>;
}

// Size calculation function
const sizeThatFits = ({ proposal, props, children }) : LayoutMeasurement => {
    return {
        frame: proposal
    };
}

layoutRegistry.register(
    TextEditor,
    sizeThatFits
);
