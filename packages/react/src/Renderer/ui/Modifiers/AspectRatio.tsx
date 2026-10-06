import React from 'react';
import { useStyle, ClearStyle } from '../Style';
import { useLayout, LayoutNode, layoutRegistry, getOffer, isKnownLength } from '../Layout';
import type { LayoutSizingFunction } from '../Layout/LayoutTypes';
import { defaultSizingFunction } from '../Layout/utils';
import { useLayoutContext } from '../Layout/LayoutNode';
import type { Offer } from '../Layout';
import { ImageFitContext, useImageNaturalSize, svgDataURL, cachedNaturalSize } from '../ImageFit';
import type { NaturalSize } from '../ImageFit';
import { UIImage } from '../Views/Image';
import { Padding, paddingInsetsFromProps } from './Padding';
import { Frame } from './Frame';
import { useAnimationNode } from '../AnimatableStyle';
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
 * With no ratio, the child's own is used: its ideal size (an image's pixel
 * size, plus any padding, or a fixed frame), otherwise 1.
 */
export function AspectRatio(props: AspectRatioProps): React.ReactNode {
    const { aspectRatio, contentMode, children } = props;
    const mode: ContentMode = contentMode === 'fill' ? 'fill' : 'fit';

    const parentEnvironment = useLayoutContext()?.parentLayoutResult?.environment;
    const offer = getOffer(parentEnvironment);
    const layout = useLayout(props, AspectRatio);
    const parentStyle = useStyle();

    const image = findImage(children);
    const imageURL = imageSource(image);
    const natural = useImageNaturalSize(imageURL, image?.dimensions);
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    if (ignoresProposal(measureUnoffered(children, parentEnvironment).frame, image)) {
        return <>{children}</>;
    }

    const explicit = explicitRatio(aspectRatio);
    const ideal = idealSize(children, () => natural);
    const ratio = explicit ?? (ideal ? ideal.width / ideal.height : image ? null : 1);

    // An image whose size isn't known yet: the box takes what is offered where
    // that is definite, and an <img> sizes it where it isn't, so it has its
    // file's ratio as soon as the browser does (server rendering included).
    const box = ratio != null ? boxLayout(offer, ratio, mode, ideal) : unknownRatioLayout(offer, imageURL);
    const style: React.CSSProperties = {
        ...parentStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
        ...box.style,
        // Accumulated animatable values (opacity, offset) apply to the box,
        // before ClearStyle resets them for the content.
        ...animationStyle,
    };

    // Inside the box, both lengths are definite: in points when the box's size
    // is known, otherwise to CSS.
    const known = ratio != null ? boxSize(offer, ratio, mode) : null;
    const innerLayout = {
        ...layout,
        environment: { ...layout.environment, proposal: { width: known?.width ?? 'fill', height: known?.height ?? 'fill' } },
    };

    const sized = box.strut != null || box.img != null;
    return (
        <LayoutNode layout={innerLayout}>
            <ClearStyle>
                <div className="aspectRatio" ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
                    {box.strut != null && <Strut {...box.strut} />}
                    {box.img != null && <img aria-hidden="true" alt="" src={box.img.src} style={box.img.style} />}
                    <ImageFitContext.Provider value={{ contentMode: mode, intrinsic: explicit == null }}>
                        {sized ? <div style={cellStyle}>{children}</div> : children}
                    </ImageFitContext.Provider>
                </div>
            </ClearStyle>
        </LayoutNode>
    );
}

/** The box's size in points, when the offer and ratio determine it. */
function boxSize(offer: Offer, ratio: number, mode: ContentMode): { width: number; height: number } | null {
    const { width: W, height: H } = offer;
    if (typeof W === 'number' && typeof H === 'number') {
        const width = (mode === 'fit' ? Math.min : Math.max)(W, H * ratio);
        return { width, height: width / ratio };
    }
    if (typeof H === 'number' && W === null) return { width: H * ratio, height: H };
    if (typeof W === 'number' && H === null) return { width: W, height: W / ratio };
    return null;
}

/**
 * The box for an image whose ratio isn't known yet. With both lengths definite,
 * the box takes them and the image draws contained or covered. Otherwise a
 * hidden <img> with the unknown length auto sizes the box from the file.
 */
function unknownRatioLayout(offer: Offer, src: string | null): BoxLayout {
    const { width: W, height: H } = offer;
    const length = (value: typeof W) => (typeof value === 'number' ? px(value) : value === 'fill' ? '100%' : 'auto');
    if (W !== null && H !== null) {
        return { style: { width: length(W), height: length(H) } };
    }
    if (!src) return { style: { width: length(W), height: 0 } };
    return {
        style: { ...gridBox, width: W === null ? 'auto' : length(W), height: H === null ? 'auto' : length(H) },
        img: { src, style: { gridArea: '1 / 1', display: 'block', width: length(W), height: length(H), visibility: 'hidden' } },
    };
}

interface BoxLayout {
    style: React.CSSProperties;
    /** A width the box asks for (see Strut). */
    strut?: StrutProps;
    /** An image that sizes the box from its file (see unknownRatioLayout). */
    img?: { src: string; style: React.CSSProperties };
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

/** The single element a modifier chain continues with, or null. */
function onlyChild(node: React.ReactNode): React.ReactElement<any> | null {
    const nodes = React.Children.toArray(node);
    return nodes.length === 1 && React.isValidElement(nodes[0]) ? (nodes[0] as React.ReactElement<any>) : null;
}

/**
 * Views a modifier chain looks through to its content: modifiers that draw
 * nothing of their own, and padding and frames, whose ideal size derives
 * from their content's.
 */
function passesThrough(element: React.ReactElement<any>): boolean {
    return element.type === Padding || element.type === Frame || !layoutRegistry.get(element.type as React.ElementType);
}

/** The Image a modifier chain ends in. */
function findImage(node: React.ReactNode): (UIImage & { resizable?: boolean }) | null {
    let element = onlyChild(node);
    while (element) {
        if (element.type === UIImage) return element.props as UIImage;
        if (!passesThrough(element)) return null;
        element = onlyChild(element.props.children);
    }
    return null;
}

function imageSource(image: UIImage | null): string | null {
    return image?.url ?? (image?.svg ? svgDataURL(image.svg) : null);
}

/**
 * SwiftUI's ideal size for a modifier chain: an image's pixel size, plus
 * padding, with a fixed frame length replacing its content's. Null when the
 * chain's content has none (a shape or color, whose ratio is then 1).
 */
function idealSize(node: React.ReactNode, naturalOf: (image: UIImage) => NaturalSize | null): NaturalSize | null {
    const element = onlyChild(node);
    if (!element) return null;
    if (element.type === UIImage) return naturalOf(element.props);
    if (!passesThrough(element)) return null;
    const content = idealSize(element.props.children, naturalOf);
    if (element.type === Padding) {
        if (!content) return null;
        const insets = paddingInsetsFromProps(element.props);
        return { width: Math.max(0, content.width + insets.left + insets.right), height: Math.max(0, content.height + insets.top + insets.bottom) };
    }
    if (element.type === Frame) {
        const width = isKnownLength(element.props.width) ? element.props.width : content?.width;
        const height = isKnownLength(element.props.height) ? element.props.height : content?.height;
        return width != null && height != null && width > 0 && height > 0 ? { width, height } : null;
    }
    return content;
}

const UNSPECIFIED = { width: null, height: null };

/**
 * The child's size with nothing offered, SwiftUI's ideal-size probe: a child
 * that is fixed or sized by its content there ignores proposals. Measured once
 * per sizing pass, so nested aspect ratios cost linear time.
 */
function measureUnoffered(children: React.ReactNode, environment?: Record<string, any> | null) {
    return defaultSizingFunction({ proposal: UNSPECIFIED, props: {}, children, environment: { ...(environment ?? {}), proposal: UNSPECIFIED } });
}

/** A child with a size of its own (fixed or content-sized), or a non-resizable image, ignores the proposal. */
function ignoresProposal(size: { width?: number | null; height?: number | null }, image: ReturnType<typeof findImage>): boolean {
    if (image && !image.resizable) return true;
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
const sizeThatFits: LayoutSizingFunction = ({ props, children, environment }) => {
    const probe = measureUnoffered(children, environment);
    const image = findImage(children);
    if (ignoresProposal(probe.frame, image)) return probe;

    const offer = getOffer(environment);
    const mode: ContentMode = props.contentMode === 'fill' ? 'fill' : 'fit';
    const ideal = idealSize(children, (img) => cachedNaturalSize(imageSource(img), img.dimensions));
    const ratio = explicitRatio(props.aspectRatio) ?? (ideal ? ideal.width / ideal.height : image ? null : 1);
    const { width: W, height: H } = offer;

    const known = ratio ? boxSize(offer, ratio, mode) : null;
    if (known) return { frame: known };
    if (typeof H === 'number' && W === 'fill' && mode === 'fit') {
        // Its size comes from CSS (see boxLayout): a frame with only a height hugs it.
        return { frame: { width: null, height: null } };
    }
    return probe;
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
