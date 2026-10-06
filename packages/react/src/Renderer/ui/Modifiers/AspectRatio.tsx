import React from 'react';
import { useStyle, ClearStyle } from '../Style';
import { useLayout, LayoutNode, layoutRegistry, getOffer, isKnownLength } from '../Layout';
import type { LayoutSizingFunction } from '../Layout/LayoutTypes';
import { defaultSizingFunction } from '../Layout/utils';
import { useLayoutContext } from '../Layout/LayoutNode';
import type { Offer } from '../Layout';
import { ImageFitContext, useImageNaturalSize, svgDataURL, cachedNaturalSize } from '../ImageFit';
import { UIImage } from '../Views/Image';
import { px } from '../../Utils';

type ContentMode = 'fit' | 'fill';

interface AspectRatioProps {
    aspectRatio?: number | null;
    contentMode?: ContentMode | null;
    children?: React.ReactNode;
}

/**
 * aspectRatio(ratio?, contentMode?)
 *
 * SwiftUI proposes its child the largest size of the ratio that fits the
 * offered size (fit), or the smallest that covers it (fill). A child that
 * ignores proposals (fixed or content-sized) keeps its size.
 *
 * The box is sized from what the parent offers (see Layout/offer.ts):
 * - width and height known: exact points
 * - height known, width from CSS: height × ratio, capped (fit) or raised (fill)
 *   to the full width
 * - height definite but only CSS knows it: height 100%, width from the ratio
 *   (exact unless the width is the limit: then the box is the full width and a
 *   fitted image still draws contained)
 * - height unspecified (content-sized, as in an MCP host): width-driven
 *
 * With no ratio, the child's own is used: an image's pixel size, otherwise 1.
 */
export function AspectRatio(props: AspectRatioProps): React.ReactNode {
    const { aspectRatio, contentMode, children } = props;
    const mode: ContentMode = contentMode === 'fill' ? 'fill' : 'fit';

    const parentEnvironment = useLayoutContext()?.parentLayoutResult?.environment;
    const offer = getOffer(parentEnvironment);
    const layout = useLayout(props, AspectRatio);
    const parentStyle = useStyle();

    const image = findImage(children);
    const natural = useImageNaturalSize(image?.url ?? (image?.svg ? svgDataURL(image.svg) : null), image?.dimensions);

    if (ignoresProposal(children, image, parentEnvironment)) {
        return <>{children}</>;
    }

    const explicit = explicitRatio(aspectRatio);
    const ratio = explicit ?? (natural ? natural.width / natural.height : image ? null : 1);

    const box = ratio == null ? { style: { width: '100%', height: 0 } } : boxLayout(offer, ratio, mode, natural);
    const style: React.CSSProperties = {
        ...parentStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
        ...box.style,
    };

    // Inside the box, both lengths are definite.
    const innerLayout = {
        ...layout,
        environment: { ...layout.environment, proposal: { width: 'fill', height: 'fill' } },
    };

    return (
        <LayoutNode layout={innerLayout}>
            <ClearStyle>
                <div className="aspectRatio" style={style}>
                    {box.strut != null && <Strut {...box.strut} />}
                    <ImageFitContext.Provider value={{ contentMode: mode, intrinsic: explicit == null }}>
                        {box.strut != null ? <div style={cellStyle}>{children}</div> : children}
                    </ImageFitContext.Provider>
                </div>
            </ClearStyle>
        </LayoutNode>
    );
}

interface BoxLayout {
    style: React.CSSProperties;
    /** A width the box asks for (see Strut). */
    strut?: StrutProps;
}

export function boxLayout(offer: Offer, ratio: number, mode: ContentMode, natural?: { width: number; height: number } | null): BoxLayout {
    const { width: W, height: H } = offer;
    const pick = mode === 'fit' ? Math.min : Math.max;

    if (typeof W === 'number' && typeof H === 'number') {
        const width = pick(W, H * ratio);
        return { style: { width: px(width), height: px(width / ratio), flexShrink: 0 } };
    }
    if (typeof H === 'number') {
        if (W === 'fill') {
            // Fit: height × ratio, or less when the container is narrower; a
            // frame with only a height hugs it, and a narrow column shrinks it.
            // Fill: height × ratio, or the container's width when wider; like
            // SwiftUI's, a column holding it is at least height × ratio wide.
            return mode === 'fit'
                ? { style: { ...gridBox, minWidth: 0, aspectRatio: String(ratio) }, strut: { width: H * ratio, compressible: true } }
                : { style: { ...gridBox, minWidth: '100%', flexShrink: 0, aspectRatio: String(ratio) }, strut: { width: H * ratio, compressible: false } };
        }
        return { style: { width: px(H * ratio), height: px(H), flexShrink: 0 } };
    }
    if (H === 'fill') {
        return mode === 'fit'
            ? { style: { height: '100%', maxWidth: typeof W === 'number' ? px(W) : '100%', aspectRatio: String(ratio) } }
            : { style: { height: '100%', minWidth: typeof W === 'number' ? px(W) : '100%', aspectRatio: String(ratio) } };
    }
    if (typeof W === 'number') return { style: { width: px(W), height: px(W / ratio), flexShrink: 0 } };
    if (W === 'fill') return { style: { width: '100%', aspectRatio: String(ratio) } };
    // Nothing offered: the child's ideal size, as SwiftUI does.
    const width = natural ? natural.width : 10;
    return { style: { width: px(width), height: px(width / ratio), flexShrink: 0 } };
}

/** A box whose one grid cell, holding the strut and the content, fills it. */
const gridBox: React.CSSProperties = {
    display: 'grid',
    justifyContent: 'stretch',
    alignContent: 'stretch',
    justifyItems: 'stretch',
    alignItems: 'stretch',
};

interface StrutProps {
    width: number;
    /** Whether the box may shrink below `width` to fit its container. */
    compressible: boolean;
}

/**
 * Asks a grid box for `width` points. Compressible, the box takes `width` or
 * its container's width, whichever is less. That cannot be the box's own
 * `width` with `max-width: 100%`, which would hold a column at least `width`
 * wide: CSS ignores a percentage max-width when it computes a min-content
 * size. A replaced element with a percentage max-width is compressible instead
 * (its min-content size is 0), so the box hugs `width` and still shrinks.
 * Incompressible, the strut holds the box and its column at least `width` wide.
 */
function Strut({ width, compressible }: StrutProps) {
    return (
        <svg
            aria-hidden="true"
            width={width}
            height={0}
            style={{ gridArea: '1 / 1', display: 'block', width: px(width), maxWidth: compressible ? '100%' : undefined, height: 0, visibility: 'hidden' }}
        />
    );
}

const cellStyle: React.CSSProperties = {
    gridArea: '1 / 1',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

/** The Image a modifier chain ends in, looking through modifiers that draw no element. */
function findImage(node: React.ReactNode): (UIImage & { resizable?: boolean }) | null {
    let nodes = React.Children.toArray(node);
    while (nodes.length === 1 && React.isValidElement(nodes[0])) {
        const element = nodes[0] as React.ReactElement<any>;
        if (element.type === UIImage) return element.props as UIImage;
        if (layoutRegistry.get(element.type as React.ElementType)) return null;
        nodes = React.Children.toArray(element.props.children);
    }
    return null;
}

/** A child with a size of its own (fixed or content-sized), or a non-resizable image, ignores the proposal. */
function ignoresProposal(children: React.ReactNode, image: ReturnType<typeof findImage>, environment?: Record<string, any> | null): boolean {
    if (image && !image.resizable) return true;
    const size = defaultSizingFunction({ proposal: { width: null, height: null }, props: {}, children, environment: environment ?? {} }).frame;
    return (isKnownLength(size.width) && isKnownLength(size.height)) || (size.width == null && size.height == null);
}

function explicitRatio(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * What the box reports to the layout pass. Fitting under a known height, the
 * width comes from the box, so a frame with only a height hugs it as SwiftUI's
 * does. With both lengths and the ratio known, the size is exact. Otherwise the
 * box is flexible, like the child.
 */
const sizeThatFits: LayoutSizingFunction = ({ proposal, props, children, environment }) => {
    const child = defaultSizingFunction({ proposal, props, children, environment });
    const image = findImage(children);
    if (ignoresProposal(children, image, environment)) return child;

    const offer = getOffer(environment);
    const mode: ContentMode = props.contentMode === 'fill' ? 'fill' : 'fit';
    const natural = image ? cachedNaturalSize(image.url ?? (image.svg ? svgDataURL(image.svg) : null), image.dimensions) : null;
    const ratio = explicitRatio(props.aspectRatio) ?? (natural ? natural.width / natural.height : image ? null : 1);
    const { width: W, height: H } = offer;

    if (ratio && typeof W === 'number' && typeof H === 'number') {
        const width = (mode === 'fit' ? Math.min : Math.max)(W, H * ratio);
        return { frame: { width, height: width / ratio } };
    }
    if (ratio && typeof H === 'number' && W === null) {
        return { frame: { width: H * ratio, height: H } };
    }
    if (typeof H === 'number' && W === 'fill' && mode === 'fit') {
        // Its size comes from CSS (see boxLayout): a frame with only a height hugs it.
        return { frame: { width: null, height: null } };
    }
    return child;
}

layoutRegistry.register(AspectRatio, sizeThatFits);

export function ScaledToFit({ children }: { children?: React.ReactNode }): React.ReactNode {
    return <AspectRatio aspectRatio={null} contentMode="fit">{children}</AspectRatio>;
}

export function ScaledToFill({ children }: { children?: React.ReactNode }): React.ReactNode {
    return <AspectRatio aspectRatio={null} contentMode="fill">{children}</AspectRatio>;
}

layoutRegistry.register(ScaledToFit, (args) => sizeThatFits({ ...args, props: { aspectRatio: null, contentMode: 'fit' } }));
layoutRegistry.register(ScaledToFill, (args) => sizeThatFits({ ...args, props: { aspectRatio: null, contentMode: 'fill' } }));
