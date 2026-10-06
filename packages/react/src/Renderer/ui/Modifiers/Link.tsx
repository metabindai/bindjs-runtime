import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { ActionsProvider, ControlProvider } from '../Actions';
import { useRendererContext } from '../../RendererContext';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * Link modifier
 * Renders the component as a link (<a href>) to the specified URL.
 *
 * A plain click opens the URL through the runtime's openURL, which a host can
 * intercept (for example to route internal URLs client-side). The browser handles
 * the rest itself: modified and middle clicks open a new tab or window, and the
 * link can be copied and crawled.
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

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        if (event.defaultPrevented) {
            return;
        }

        // Leave modified clicks on a real link to the browser.
        const isLink = (event.target as Element).closest?.('a[href]') != null;
        if (isLink && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) {
            return;
        }

        event.preventDefault();
        rendererContext?.openURLCallback?.(rawValue);
    }

    return (
        <StyleProvider style={style}>
            <ActionsProvider actions={{ onClick }}>
                <ControlProvider as="a" attributes={{ href: rawValue }}>
                    <LayoutNodeChildren layout={layout}>
                        {children}
                    </LayoutNodeChildren>
                </ControlProvider>
            </ActionsProvider>
        </StyleProvider>
    );
}
