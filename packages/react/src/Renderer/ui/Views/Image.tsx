import { useStyle } from '../Style';
import { foregroundStyleToCSS, useForegroundStyleContext } from '../Modifiers/ForegroundStyle';
import { SFSymbol } from './Utils/SFSymbol';
import { useAssets } from '../Assets';
import { useFontStyle } from '../Modifiers/Font';
import { layoutRegistry } from '../Layout';
import { useAnimationNode } from '../AnimatableStyle';

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

function ImageContent({ url, resizable, contentMode }: { url?: string, resizable?: boolean, contentMode?: 'fit' | 'fill' | undefined }) {

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style = { ...useStyle(), ...animationStyle };

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

        /**
         * Currently we support image aspect ratios via a contentMode attribute, which affects how the image is 
         * displayed within its frame.
         * 
         * This is different from SwiftUI's aspectRatio modifier, which affects the size of the view itself.
         * We may add support for that in the future.
         */
        if (contentMode === 'fit') {
            imageStyle.backgroundSize = 'contain';
        } else if (contentMode === 'fill') {
            imageStyle.backgroundSize = 'cover';
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
        return <ImageContent url={url} resizable={resizable} contentMode={contentMode} />
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
            const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
            return <ImageContent url={svgUrl} resizable={resizable} contentMode={contentMode} />
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
