import React from 'react';
import { px, pt } from '../../Utils';
import { ColorStyle } from '../Styles/ColorStyle';
import { colorStyleToCSS } from '../Styles/ColorStyle';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { useEnvironment } from '../Environment';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNodeChildren } from '../Layout/LayoutNode';

/**
 * Shadow
 */
export function Shadow(props : { rawValue?: string, radius: string, x: string, y: string, color?: ColorStyle | React.ReactNode | undefined, children: React.ReactNode[] }) {
    const { rawValue, radius, x, y, color, children } = props;
    const layout = useLayout(props, Shadow);
    const environment = useEnvironment();
    const shadowColor = colorNodeToCSS(color as React.ReactNode, environment.colorScheme) ?? colorStyleToCSS(color as ColorStyle, undefined, environment.colorScheme) ?? '#00000055';

    // Color takes ColorProps directly, rathern than a Color node
    if (typeof rawValue === 'function') {  
        return children
    }

    var shadowRadius = radius ?? "10"
    var shadowX = x ?? "0"
    var shadowY = y ??  String(parseInt(shadowRadius) / 2)
    
    if (rawValue) {
        shadowRadius = rawValue;
    }

    // Create the drop shadow filter value
    const dropShadowFilter = `drop-shadow(${pt(shadowX)} ${pt(shadowY)} ${px(shadowRadius)} ${shadowColor})`;
    
    // Apply the shadow to the outer wrapper - this will apply shadow AFTER any transforms
    const wrapperStyle: React.CSSProperties = {
        ...layoutStyle(layout),

        filter: dropShadowFilter,
        willChange: 'filter', // Hint to browser to create a compositing layer
        transformStyle: 'preserve-3d' // Prevents flattening of transform hierarchy
    };

    const contentContainerStyle : React.CSSProperties = {
        ...layoutStyle(layout),
    }
    
    return (
        <div key="shadow-wrapper" className="shadow-wrapper" style={wrapperStyle}>
            <div key="shadow-content" className="shadow-content" style={contentContainerStyle}> 
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </div> 
        </div>
    );
}
