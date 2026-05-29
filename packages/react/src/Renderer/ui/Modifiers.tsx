import React from 'react';
import { useStyle, StyleProvider } from './Style';
import { useVariables } from './Variable';
import { ActionsProvider } from './Actions';
import { useRendererContext } from '../RendererContext';
import { EnvironmentStyleProvider, useEnvironmentStyle } from './Style';

export function BackgroundBlur({ rawValue, children }) {
    const style = { ...useStyle() };
    style.backdropFilter = `blur(${rawValue ?? 20}px)`;
    return <StyleProvider style={style}>{children}</StyleProvider>;
}

function Grayscale({ rawValue, children }) {
    const style = { ...useStyle() };
    if (rawValue > 0) {
        // Check if there's an existing filter and append to it if it exists
        const grayscaleFilter = `grayscale(${rawValue}%)`;
        if (style.filter) {
            style.filter = `${style.filter} ${grayscaleFilter}`;
        } else {
            style.filter = grayscaleFilter;
        }
    }
    return <StyleProvider style={style}>{children}</StyleProvider>;
}

export function ThumbnailScale({ rawValue, width, height, children }: { rawValue?: string, width?: number, height?: number, children: React.ReactNode[] }) {
    const style = { ...useStyle() };
    const { variables, setVariables } = useVariables();


    //let thumbnailWidth  = parseFloat(variables['display.size.width']) ?? 150.0
    let thumbnailWidth = parseFloat(variables['thumbnail.size.width']) ?? 150.0
    let thumbnailHeight = parseFloat(variables['thumbnail.size.height']) ?? 150.0

    let widthScaleAmount = thumbnailWidth / (width ?? 150)
    let heightScaleAmount = thumbnailHeight / (height ?? 150)

    if (widthScaleAmount < heightScaleAmount) {
        style.transform = `scale(${widthScaleAmount})`;
    } else {
        style.transform = `scale(${heightScaleAmount})`;
    }

    return <StyleProvider style={style}>{children}</StyleProvider>;
}

/**
 * ContainerRelativeFrame
 */
export function ContainerRelativeFrame({ rawValue, children }) {
    return children
}


export function UnhandledModifer({ children }) {
    return children
}

/**
 * Link
 * @param param0 
 * @returns 
 */
function Link({ rawValue, children }) {
    const style = { ...useStyle() };

    const rendererContext = useRendererContext();

    const onClick = () => {
        if (rendererContext && rendererContext.navigateCallback) {
            rendererContext.navigateCallback(rawValue);
        }
    }

    style.cursor = 'pointer';

    return (
        <StyleProvider style={style}>
            <ActionsProvider actions={{ onClick }}>{children}</ActionsProvider>
        </StyleProvider>
    )
}

export function ButtonStyle({ rawValue, handlerId, environmentId, name, props, buttonStyleProps, children }) {
    const style = { ...useEnvironmentStyle() };

    style.buttonStyle = { name, props: props ?? buttonStyleProps, handlerId, environmentId };

    return <EnvironmentStyleProvider style={style}>{children}</EnvironmentStyleProvider>;
}   