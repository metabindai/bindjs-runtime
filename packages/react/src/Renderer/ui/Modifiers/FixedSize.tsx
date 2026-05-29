import React, { ReactNode } from 'react';
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface FixedSizeProps {
    horizontal?: boolean;
    vertical?: boolean;
    children?: ReactNode;
}

/**
 * FixedSize modifier that prevents a component from resizing in specified directions
 * It can lock the width (horizontal), height (vertical), or both
 */
export function FixedSize(props: FixedSizeProps): React.ReactNode {
    const { horizontal, vertical, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, FixedSize, { hasDOMElement: false });
    
    const style = { ...useStyle() };

    // Apply fixed size properties based on the layout context and specified directions
    if (horizontal) {
        // Make element keep its intrinsic width and not grow/shrink
        style.flexShrink = 0;
        style.flexGrow = 0;
        style.whiteSpace = 'nowrap';
        // For HStack, preserve width
        //if (layoutContext.container === 'hstack') {
        //  style.flexBasis = 'auto';
        //}
    }

    //   if (vertical) {
    //     // Make element keep its intrinsic height
    //     if (layoutContext.container === 'vstack') {
    //       style.flexShrink = 0;
    //       style.flexGrow = 0;
    //       style.flexBasis = 'auto';
    //     } else {
    //       // For other containers, enforce fixed height if one is set
    //       if (style.height) {
    //         style.minHeight = style.height;
    //         style.maxHeight = style.height;
    //       }
    //     }
    //   }

    //   // For ZStack, we need to ensure the element doesn't get stretched
    //   if (layoutContext.container === 'zstack') {
    //     if (horizontal) {
    //       style.width = style.width || 'auto';
    //       style.alignSelf = 'center';
    //     }
    //     if (vertical) {
    //       style.height = style.height || 'auto';
    //       style.alignSelf = 'center';
    //     }
    //   }

    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}