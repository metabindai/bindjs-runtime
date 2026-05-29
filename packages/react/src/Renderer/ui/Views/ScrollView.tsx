import { useRef } from 'react';
import { useStyle, ClearStyle, StyleProvider, useEnvironmentStyle, EnvironmentStyleProvider } from '../Style';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { ScrollViewProvider, useDocumentScroll, DocumentScrollProvider } from '../ScrollViewContext';

export function ScrollView(props) {
    const { axis = 'vertical', showsIndicators = true, children } = props;

    // Check if we should use document scrolling (pass through children)
    const documentScrollContext = useDocumentScroll();

    // Ref for the scroll container
    const scrollRef = useRef<HTMLDivElement>(null);

    // Perform layout calculation
    const layout = useLayout(props, ScrollView);

    // Get environment style for scroll target behavior
    const envStyle = useEnvironmentStyle();
    const scrollTargetBehavior = envStyle.scrollTargetBehavior;
    const baseStyle = useStyle();

    // If document scroll is enabled, render children directly without scroll container
    // Reset the context to false so nested ScrollViews behave normally
    if (documentScrollContext.useDocumentScroll && axis == 'vertical') {
        const containerInfo = {
            '_container': 'scrollview'
        };

        return (
            <DocumentScrollProvider useDocumentScroll={false}>
                <ClearStyle>
                    <EnvironmentStyleProvider style={{ ...envStyle, scrollTargetBehavior: null }}>
                        <StyleProvider style={containerInfo as any}>
                            <>{children}</>
                        </StyleProvider>
                    </EnvironmentStyleProvider>
                </ClearStyle>
            </DocumentScrollProvider>
        );
    }

    const style: React.CSSProperties = {
        // Apply environment style.
        ...baseStyle,

        // Apply layout positioning css
        ...layoutStyle(layout),
    };

    // Handle different axis options
    if (axis === 'vertical') {
        style['overflowY'] = 'scroll';
        style['overflowX'] = 'hidden';

        // Apply scroll snapping based on scrollTargetBehavior
        if (scrollTargetBehavior) {
            style['scrollSnapType'] = 'y mandatory';
        }
    } else if (axis === 'horizontal') {
        style['overflowX'] = 'scroll';
        style['overflowY'] = 'hidden';

        // Apply scroll snapping based on scrollTargetBehavior
        if (scrollTargetBehavior) {
            style['scrollSnapType'] = 'x mandatory';
        }
    } else if (axis === 'both') {
        style['overflowX'] = 'scroll';
        style['overflowY'] = 'scroll';

        // Apply scroll snapping based on scrollTargetBehavior
        if (scrollTargetBehavior) {
            style['scrollSnapType'] = 'both mandatory';
        }
    }

    // Handle scroll indicators visibility directly in the style object
    if (!showsIndicators) {
        style['scrollbarWidth'] = 'none'; // Firefox
        style['msOverflowStyle'] = 'none'; // IE/Edge

        style['scrollbarColor'] = 'transparent';
    }

    const containerInfo = {
        '_container': 'scrollview'
    };

    // Reset scrollTargetBehavior for children (it's consumed by this ScrollView)
    const childEnvStyle = {
        ...envStyle,
        scrollTargetBehavior: null
    };

    return (
        <div
            ref={scrollRef}
            className="scrollview"
            style={style}
        >
            <ClearStyle>
                <EnvironmentStyleProvider style={childEnvStyle}>
                    <ScrollViewProvider scrollRef={scrollRef} axis={axis}>
                        <StyleProvider style={containerInfo as any}>
                            <div>{children}</div>
                        </StyleProvider>
                    </ScrollViewProvider>
                </EnvironmentStyleProvider>
            </ClearStyle>
        </div>
    );
}

const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    const scrollViewEnvironment = {
        layout: 'scrollView'
    };
    return {
        environment: scrollViewEnvironment,
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    ScrollView,
    sizeThatFits
);
