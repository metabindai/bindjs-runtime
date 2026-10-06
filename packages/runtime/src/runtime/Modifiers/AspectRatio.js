// aspectRatio(ratio?, contentMode?) carries two arguments; the generic modifier
// keeps only the first, which dropped contentMode and sent the ratio as
// `rawValue`, a key bindjs-apple does not read. The renderers read
// { aspectRatio, contentMode } (bindjs-android also accepts `rawValue`).
//
// The content mode is always explicit. An omitted mode is "fit", as the types
// document; bindjs-apple would otherwise default to .fill.
//
// Without a usable ratio the key is left out rather than sent as null, which
// means the content's own ratio; bindjs-android parses the ratio as a non-null
// number and rejects the whole tree on a null.
export function AspectRatio({ args }) {
    let [ratio, contentMode] = args;

    // Object form: aspectRatio({ aspectRatio, contentMode })
    if (ratio != null && typeof ratio === 'object') {
        ({ aspectRatio: ratio, contentMode } = ratio);
    }

    // aspectRatio("fit") names only the content mode.
    if (typeof ratio === 'string' && contentMode == null) {
        contentMode = ratio;
        ratio = null;
    }

    const props = { contentMode: contentMode === 'fill' ? 'fill' : 'fit' };
    if (typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0) {
        props.aspectRatio = ratio;
    }
    return { props };
}
