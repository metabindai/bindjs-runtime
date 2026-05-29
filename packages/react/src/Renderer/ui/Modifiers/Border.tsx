import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { px, pxnull } from '../../Utils'
import { ColorStyle } from '../Styles/ColorStyle';
import { GradientStyle } from '../Styles/GradientStyle';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { gradientNodeToCSS } from '../Utils/gradientNodeToCSS';
import { materialNodeToCSS } from '../Utils/materialNodeToCSS';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { useEnvironment } from '../Environment';

/**
 * Border
 */
interface BorderProps {
    rawValue?: React.ReactNode | string | number;
    style?: React.ReactNode | undefined;
    width?: string | number;
    children: React.ReactNode[];
}

export function Border(props: BorderProps) {
    const { rawValue, width, style, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, Border);
    const environment = useEnvironment();

    var cssStyle = {
        ...useStyle()
        // Note: StyleProvider doesn't create DOM element, so no layoutStyle needed
    };

    const defaultWidth = '1px';

    // Number of undefined
    if (typeof rawValue === 'number' || (rawValue === undefined && style == undefined)) {
        // When only a number is passed, use it as width with default color
        cssStyle.borderWidth = pxnull(rawValue as string) ?? defaultWidth;
        cssStyle.borderColor = cssStyle.borderColor ?? '#000000';
        cssStyle.borderStyle = 'solid';

        // Style node
    } else if (React.isValidElement(rawValue) || React.isValidElement(style)) {

        const color = colorNodeToCSS(style ?? rawValue, environment.colorScheme);
        const gradient = gradientNodeToCSS(style ?? rawValue, environment.colorScheme);
        const material = materialNodeToCSS(style ?? rawValue, environment.colorScheme);

        let borderWidth: string | number = defaultWidth;

        // Set width if provided, or default to 1px
        if (typeof width === 'number') {
            borderWidth = `${width}px`;
        } else {
            borderWidth = cssStyle.borderWidth ?? pxnull(width as string) ?? defaultWidth;
        }

        if (color) {
            cssStyle.borderColor = color;
            cssStyle.borderWidth = px(borderWidth);
            cssStyle.borderStyle = 'solid';
        } else if (gradient) {
            cssStyle.borderImage = gradient;
            cssStyle.borderImageSlice = 1;
            cssStyle.borderImageWidth = typeof width === 'number' ? `${width}px` : (pxnull(width as string) ?? px("1"));
            cssStyle.borderImageOutset = 0;
            cssStyle.borderImageRepeat = 'stretch';
        } else if (material) {
            cssStyle = { ...cssStyle, ...material };
            cssStyle.mask = 'linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px) content-box exclude, linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px)'
            cssStyle.borderColor = 'rgba(255,255,255,0.01)'
            cssStyle.borderWidth = px(borderWidth);
            cssStyle.borderStyle = 'solid';
        }

    }

    return (
        <StyleProvider style={cssStyle}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}

interface BorderWidthProps {
    rawValue?: string | number;
    children: React.ReactNode[];
}

export function BorderWidth({ rawValue, children }: BorderWidthProps) {
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, BorderWidth);

    var style = {
        ...useStyle()
        // Note: StyleProvider doesn't create DOM element, so no layoutStyle needed
    };

    if (typeof rawValue === 'number') {
        style.borderWidth = `${rawValue}px`;
    } else if (rawValue) {
        style.borderWidth = px(rawValue);
    }

    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}
