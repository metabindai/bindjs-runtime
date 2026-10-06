import React from 'react';
import { useStyle, ClearStyle, ClearElementSemantics, useElementProps } from '../Style';
import { Color } from '../Views/Color';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';;
import { LayoutNode, layoutRegistry, layoutStyle, useLayout, LayoutMeasurement, LayoutNodeChildren } from '../Layout';
import { useEnvironment } from '../Environment';
import { useAnimationNode } from '../AnimatableStyle';
import { ClearTextInputPadding } from '../Utils/textInputPadding';

/**
 * Renders a SwiftUI-style `Background` view, which places visual content
 * (such as a color or another component) *behind* its child views.
 *
 * This component mirrors SwiftUI’s `.background(content:)` modifier behavior:
 * - If a `content` element is provided, it is rendered behind the `children`.
 * - If the content is a `Color` component, it’s applied as a `background-color`.
 * - If there are no valid background elements, the `children` are rendered directly.
 *
 * Layout is determined using `Background.prototype.sizeThatFits`, allowing
 * the background to size itself according to the proposed parent frame
 * and the sizes of its children.
 *
 * @param {object} props
 * @param {string | React.ReactNode} [props.rawValue]
 *     Deprecated. The legacy `rawValue` property — replaced by `content`.
 * @param {React.ReactNode} props.content
 *     The background element to render. Can be a `Color` node or another React component.
 * @param {React.ReactNode[]} props.children
 *     The foreground elements (the main content of the view).
 *
 * @returns {React.ReactElement}
 *     A wrapped view containing the background and children layers.
 */
export function Background(props: { rawValue?: string | React.ReactNode, content: React.ReactNode, children: React.ReactNode[] }) {

    const { rawValue, content, children } = props;

    // --- Handle legacy props ---
    // Prefer `content`; fall back to `rawValue`.    
    const backgroundContent = content ?? rawValue;

    // Perform layout calculation
    const layout = useLayout(props, Background);
    const environment = useEnvironment();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();
    const baseStyle = useStyle();

    // Element semantics (Button, Link, accessibility modifiers)
    const { as: Element = 'div', ...elementProps } = useElementProps({ labelRole: 'group' });

    // --- If not a valid React element, return children directly ---
    if (!React.isValidElement(backgroundContent)) {
        return children
    }

    const style: React.CSSProperties = {
        ...baseStyle,

        ...layoutStyle(layout),
    };

    // --- Handle Color background ---
    if (backgroundContent.type === Color) {

        const colorValue = colorNodeToCSS(backgroundContent, environment.colorScheme);

        return (
            <ClearStyle>
                <Element ref={animationRef as React.Ref<any>} key="background" className="background" style={{ ...style, backgroundColor: colorValue as any }} {...elementProps}><ClearTextInputPadding>{children}</ClearTextInputPadding></Element>
            </ClearStyle>
        )

        // Component
    } else {
        Object.assign(style, {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        });

        const backgroundStyle: React.CSSProperties = {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
            width: '100%',
            height: '100%',
            WebkitUserSelect: 'none'
        }

        // Size overlay element to the size it's being applied to
        return (
            <Element ref={animationRef as React.Ref<any>} style={style} key="background" className="mb-background" {...elementProps}>
                <ClearElementSemantics>
                    <LayoutNode layout={null}>
                        <div style={backgroundStyle} key="content">{backgroundContent}</div>
                    </LayoutNode>
                    <div style={style} key="children">
                        <LayoutNodeChildren layout={layout}>
                            <ClearTextInputPadding>
                                {children}
                            </ClearTextInputPadding>
                        </LayoutNodeChildren>
                    </div>
                </ClearElementSemantics>
            </Element>
        )

    }

}
