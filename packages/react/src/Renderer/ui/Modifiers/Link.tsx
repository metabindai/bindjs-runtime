import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { ActionsProvider } from '../Actions';
import { useRendererContext } from '../../RendererContext';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * Link modifier
 * Makes a component clickable and navigates to the specified URL
 */
interface LinkProps {
    rawValue: string;
    children: React.ReactNode;
}

export function Link(props: LinkProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, Link);
    
    const style = {
        ...useStyle(),
        cursor: 'pointer'
        // Note: StyleProvider doesn't create DOM element, so no layoutStyle needed
    };

    const rendererContext = useRendererContext();

    const onClick = () => {
        if (rendererContext && rendererContext.navigateCallback) {
            rendererContext.navigateCallback(rawValue);
        }
    }

    return (
        <StyleProvider style={style}>
            <ActionsProvider actions={{ onClick }}>
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </ActionsProvider>
        </StyleProvider>
    );
}
