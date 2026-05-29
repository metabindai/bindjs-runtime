import React from 'react';
import { useStyle, ClearStyle, useEnvironmentStyle, EnvironmentStyleProvider } from '../Style';
import { px, asNumber } from '../../Utils'
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureMaxChild } from '../Layout/utils';
import { useAnimationNode } from '../AnimatableStyle';

export interface PaddingInsets {
    left: number,
    right: number,
    top: number,
    bottom: number
}

function paddingInsetsFromProps(props: PaddingProps): PaddingInsets {
    var insets: PaddingInsets = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }

    const { rawValue, length, leading, trailing, top, bottom, horizontal, vertical } = props

    // Default padding
    if (Object.keys(props).filter(key => key != 'children').length == 0) {
        const defaultPadding = 16
        insets = { left: defaultPadding, right: defaultPadding, top: defaultPadding, bottom: defaultPadding };

        // Value
    } else if (rawValue != null) {
        insets = { left: asNumber(rawValue), right: asNumber(rawValue), top: asNumber(rawValue), bottom: asNumber(rawValue) };

        // Length
    } else if (length != null) {
        insets = { left: asNumber(length), right: asNumber(length), top: asNumber(length), bottom: asNumber(length) };
    }

    if (leading != null) {
        insets.left = asNumber(leading);
    }

    if (trailing != null) {
        insets.right = asNumber(trailing);
    }

    if (horizontal != null) {
        insets.left = asNumber(horizontal);
        insets.right = asNumber(horizontal);
    }

    if (vertical != null) {
        insets.top = asNumber(vertical);
        insets.bottom = asNumber(vertical);
    }

    if (top != null) {
        insets.top = asNumber(top);
    }

    if (bottom != null) {
        insets.bottom = asNumber(bottom);
    }

    return insets
}

interface PaddingProps {
    rawValue?: string,
    length?: string,
    leading?: string,
    trailing?: string,
    top?: string,
    bottom?: string,
    horizontal?: string,
    vertical?: string,
    children: React.ReactNode
}

export function Padding(props: PaddingProps) {

    // Perform layout calculation
    const layout = useLayout(props, Padding);

    const { children } = props;
    const finalInsets = paddingInsetsFromProps(props);

    // Get current environment style
    const envStyle = useEnvironmentStyle();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Normalize padding values (positive values only for actual padding)
    const paddingValues = {
        left: finalInsets.left > 0 ? finalInsets.left : 0,
        right: finalInsets.right > 0 ? finalInsets.right : 0,
        top: finalInsets.top > 0 ? finalInsets.top : 0,
        bottom: finalInsets.bottom > 0 ? finalInsets.bottom : 0,
    };

    // Normalize margin values (negative insets become margins)
    const marginValues = {
        left: finalInsets.left < 0 ? finalInsets.left * 2 : 0,
        right: finalInsets.right < 0 ? finalInsets.right * 2 : 0,
        top: finalInsets.top < 0 ? finalInsets.top : 0,
        bottom: finalInsets.bottom < 0 ? finalInsets.bottom : 0,
    };

    // Initialize the style object with layout and current style values
    const style: React.CSSProperties = {
        // Apply environment style
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        WebkitUserSelect: 'none',

        // Apply padding
        paddingLeft: paddingValues.left > 0 ? px(paddingValues.left) : 0,
        paddingRight: paddingValues.right > 0 ? px(paddingValues.right) : 0,
        paddingTop: paddingValues.top > 0 ? px(paddingValues.top) : 0,
        paddingBottom: paddingValues.bottom > 0 ? px(paddingValues.bottom) : 0,

        // Apply margin (for negative insets)
        marginLeft: marginValues.left !== 0 ? px(marginValues.left) : 0,
        marginRight: marginValues.right !== 0 ? px(marginValues.right) : 0,
        marginTop: marginValues.top !== 0 ? px(marginValues.top) : 0,
        marginBottom: marginValues.bottom !== 0 ? px(marginValues.bottom) : 0,
    };

    // Handle negative padding width adjustments
    let totalPadding = finalInsets.left + finalInsets.right;
    if (totalPadding < 0) {
        style.width = 'calc(' + style.width + ' + ' + px(Math.abs(totalPadding)) + ')'
    }

    // Set scrollPadding in environment for children to use for scroll-margin
    const childEnvStyle = {
        ...envStyle,
        scrollPadding: paddingValues
    };

    return (
        <LayoutNode layout={layout}>
            <ClearStyle>
                <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
                    <EnvironmentStyleProvider style={childEnvStyle}>
                        {children}
                    </EnvironmentStyleProvider>
                </div>
            </ClearStyle>
        </LayoutNode>
    );
}

const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {

    const insets = paddingInsetsFromProps(props)

    var reportedSize = measureMaxChild({ children, proposal, environment: environment, nodeEnvironment: {} });

    if (reportedSize.width != null && reportedSize.width != Infinity) {
        reportedSize.width += Math.abs(insets.left) + Math.abs(insets.right)
    }

    if (reportedSize.height != null && reportedSize.height != Infinity) {
        reportedSize.height += Math.abs(insets.top) + Math.abs(insets.bottom)
    }

    return {
        frame: reportedSize
    }
}

layoutRegistry.register(
    Padding,
    sizeThatFits
);
