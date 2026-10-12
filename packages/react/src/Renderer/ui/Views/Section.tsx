import { useStyle, useElementProps, ClearElementSemantics } from '../Style';
import { ClearTextInputPadding } from '../Utils/textInputPadding';

export function Section({ rawValue, header, children }) {

    const currentStyle = useStyle()
    const style = {
        ...currentStyle,
        display: 'flex',
        flexDirection: 'column' as any,    
        gap: '10px',
        paddingTop: '10px',
        width: '-webkit-fill-available', 
    };

    // Element semantics (Button, Link, accessibility modifiers)
    const { as: Element = 'div', ...elementProps } = useElementProps({ labelRole: 'group' });

    return (
        <Element style={style} {...elementProps}>
            <ClearElementSemantics>
                {rawValue ?? header}
                <ClearTextInputPadding>
                    {children}
                </ClearTextInputPadding>
            </ClearElementSemantics>
        </Element>
    );
}