import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { UIImage } from '../Views/Image';
import { useLayout, LayoutNodeChildren } from '../Layout';  

/**
 * Mask modifier props
 */
interface MaskProps {
    rawValue?: React.ReactElement; // The Image component to use as a mask
    children?: React.ReactNode;
}

/**
 * Mask
 * 
 * Applies a mask to clip the component using an Image node.
 * This uses CSS mask-image property to apply bitmap or SVG masking.
 * 
 * @param rawValue The Image component to use as a mask
 * @param children The component content to be masked
 * @returns A component with the mask applied
 */
export function Mask(props: MaskProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, Mask, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    const maskImage = rawValue
    const maskUrl = React.useMemo(() => resolveMaskUrl(maskImage), [maskImage]);
    
    // Apply the mask if we have a valid URL
    if (maskUrl) {
        style.maskImage = `url(${maskUrl})`;
        style.WebkitMaskImage = `url(${maskUrl})`; // Safari support
        style.maskSize = 'contain';
        style.WebkitMaskSize = 'contain';
        style.maskRepeat = 'no-repeat';
        style.WebkitMaskRepeat = 'no-repeat';
        style.maskPosition = 'center';
        style.WebkitMaskPosition = 'center';
    }
    
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}

function resolveMaskUrl(maskImage?: React.ReactElement): string | null {
    if (!maskImage) return null;

    const maskType = maskImage.type;
    if (typeof maskType !== 'undefined' && maskType !== UIImage) {
        console.warn('Mask: Unsupported mask type', maskType);
        return null;
    }

    if (maskImage.props?.url) {
        return maskImage.props.url;
    }

    if (maskImage.props?.image) {
        return maskImage.props.image;
    }

    if (maskImage.props?.svg) {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(maskImage.props.svg)}`;
    }

    if (maskImage.props?.systemName) {
        console.warn('Mask: System images are not supported as mask sources');
    } else {
        console.warn('Mask: Unsupported mask image format', maskImage);
    }

    return null;
}
