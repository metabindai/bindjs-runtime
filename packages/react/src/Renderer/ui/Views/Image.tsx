import { useStyle } from '../Style';
import { foregroundStyleToCSS, useForegroundStyleContext } from '../Modifiers/ForegroundStyle';
import { SFSymbol } from './Utils/SFSymbol';
import { useAssets } from '../Assets';
import { useFontStyle } from '../Modifiers/Font';
import { layoutRegistry } from '../Layout';
import { useAnimationNode } from '../AnimatableStyle';
import { useImageFit, useImageNaturalSize, svgDataURL, NaturalSize } from '../ImageFit';
import { useLayoutContext } from '../Layout/LayoutNode';
import { getOffer } from '../Layout/offer';
import { px } from '../../Utils';

export interface UIImage {
    named?: string;
    id?: string;
    url?: string;
    svg?: string;
    contentMode?: 'fit' | 'fill';
    resizable?: boolean;
    systemName?: string;
    crop?: { x: number, y: number, width: number, height: number };
    dimensions?: { width: number, height: number };
}

function ImageContent({ url, resizable, contentMode, dimensions }: { url?: string, resizable?: boolean, contentMode?: 'fit' | 'fill' | undefined, dimensions?: NaturalSize }) {

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style = { ...useStyle(), ...animationStyle };

    // Set when an aspectRatio / scaledToFit / scaledToFill modifier sized the box.
    const fit = useImageFit();
    const offer = getOffer(useLayoutContext()?.parentLayoutResult?.environment);
    const natural = useImageNaturalSize(resizable && !fit ? url : null, dimensions);

    if (url == null) {
        return null;
    }

    /**
     * Resizable Image
     */
    if (resizable) {

        const imageStyle: React.CSSProperties = {
            ...style,
            width: '100%',
            height: '100%',
            backgroundImage: `url("${url}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '100% 100%'
        }

        if (fit) {
            // The box has the image's own ratio unless one was given; with one,
            // SwiftUI stretches the image to it.
            imageStyle.backgroundSize = fit.intrinsic ? (fit.contentMode === 'fill' ? 'cover' : 'contain') : '100% 100%';
        } else {
            // Image({ contentMode }) fits or fills within whatever frame the image gets.
            if (contentMode === 'fit') {
                imageStyle.backgroundSize = 'contain';
            } else if (contentMode === 'fill') {
                imageStyle.backgroundSize = 'cover';
            }

            // A resizable image takes the size it is offered, as in SwiftUI: a
            // length in points, the full container, or with nothing offered its
            // own pixel length. A percentage height against a content-sized
            // container would collapse it to nothing (MET-1652).
            if (typeof offer.height === 'number') {
                imageStyle.height = px(offer.height);
            } else if (offer.height === null) {
                imageStyle.height = natural ? px(natural.height) : 0;
            }
            if (typeof offer.width === 'number') {
                imageStyle.width = px(offer.width);
            } else if (offer.width === null && natural) {
                imageStyle.width = px(natural.width);
            }
        }

        return (
            <div ref={animationRef as React.Ref<HTMLDivElement>} style={imageStyle} />
        )

        /**
         * Non-resizable Image
         */
    } else {
        return <img ref={animationRef as React.Ref<HTMLImageElement>} style={style} src={url} alt="" />
    }
}

export function UIImage({ url, svg, crop, dimensions, systemName, resizable, contentMode }: UIImage) {
    const foregroundStyleContext = useForegroundStyleContext();
    const fontStyle = useFontStyle();

    if (url) {
        return <ImageContent url={url} resizable={resizable} contentMode={contentMode} dimensions={dimensions} />
    } else if (systemName) {
        let fontSize = fontStyle.fontSize ?? 17;
        let numericFontSize =
            typeof fontSize === 'number'
                ? fontSize
                : // CSS 'fontSize' may have px, rem, etc. Default to 17 if cannot parse.
                parseFloat(fontSize) || 17;

        const css = foregroundStyleToCSS(foregroundStyleContext, 'shape');
        const fill = css.backgroundColor ? css.backgroundColor : 'black';

        return (
            <SFSymbol
                name={systemName}
                color={fill}
                size={numericFontSize}
            />
        );
    } else if (svg) {
        const css = foregroundStyleToCSS(foregroundStyleContext, 'shape');

        // Parse html svg
        try {
            svg = setSvgFill(svg, '$foregroundColor');
            svg = svg.replace('$foregroundColor', css.backgroundColor ?? 'black');
            return <ImageContent url={svgDataURL(svg)} resizable={resizable} contentMode={contentMode} dimensions={dimensions} />
        } catch (error) {
            return 'invalid svg ' + error.message
        }
    }

    return null;
}

function setSvgFill(svgString, fillValue) {
    // quick bail if there's no <svg> at all
    if (!/<svg\b/.test(svgString)) return svgString;

    const fillAttr = `fill="${fillValue}"`;

    // 1) already has a fill="…"? 
    if (/<svg[^>]*\bfill="[^"]*"/.test(svgString)) {
        return svgString
    }

    // 2) no fill present? inject it just before the closing '>' of the <svg> tag
    return svgString.replace(
        /<svg\b([^>]*)>/,
        `<svg$1 ${fillAttr}>`
    );
}

const sizeThatFits = ({ proposal, props, children, environment }) => {
    if (props.resizable == true) {
        return {
            frame: { width: Infinity, height: Infinity }
        }
    } else {
        return {
            frame: { width: null, height: null }
        }
    }
}

layoutRegistry.register(
    UIImage,
    sizeThatFits
);
