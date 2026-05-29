// SwiftUI default padding value in points
const DEFAULT_LENGTH = 8;

export function Padding({ args }) {
    const standardizedPadding = normalizePaddingArgs(args);
    return { props: standardizedPadding };
}

Padding.environmentValue = (name, args) => {
    const standardizedPadding = normalizePaddingArgs(args);
    return { key: name, value: standardizedPadding }
}

// Normalize args to {top, leading, bottom, trailing} number type
function normalizePaddingArgs(args) {
    let padding = { top: 0, leading: 0, bottom: 0, trailing: 0 };

    if (args.length === 0) {
        // .padding() - all sides default
        padding = { top: DEFAULT_LENGTH, leading: DEFAULT_LENGTH, bottom: DEFAULT_LENGTH, trailing: DEFAULT_LENGTH };
    } else if (args.length === 1) {
        const arg = args[0];
        if (typeof arg === 'number' && isFinite(arg)) {
            // .padding(length)
            padding = { top: arg, leading: arg, bottom: arg, trailing: arg };
        } else if (typeof arg === 'string') {
            // .padding(edge)
            applyEdges([arg], DEFAULT_LENGTH, padding);
        } else if (Array.isArray(arg)) {
            // .padding(edgeArray)
            applyEdges(arg, DEFAULT_LENGTH, padding);
        } else if (typeof arg === "object" && arg !== null) {
            // .padding({ horizontal, vertical, ... })
            let matched = false;
            if (typeof arg.horizontal === "number" && isFinite(arg.horizontal)) {
                padding.leading = arg.horizontal;
                padding.trailing = arg.horizontal;
                matched = true;
            }
            if (typeof arg.vertical === "number" && isFinite(arg.vertical)) {
                padding.top = arg.vertical;
                padding.bottom = arg.vertical;
                matched = true;
            }
            // If explicit edges supplied, use (overrides horizontal/vertical)
            for (const key of ["top", "leading", "bottom", "trailing"]) {
                if (typeof arg[key] === "number" && isFinite(arg[key])) {
                    padding[key] = arg[key];
                    matched = true;
                }
            }
            // If nothing matched, fallback to all-DEFAULT_LENGTH
            if (!matched) {
                padding = { top: DEFAULT_LENGTH, leading: DEFAULT_LENGTH, bottom: DEFAULT_LENGTH, trailing: DEFAULT_LENGTH };
            }
        } else {
            // fallback
            padding = { top: DEFAULT_LENGTH, leading: DEFAULT_LENGTH, bottom: DEFAULT_LENGTH, trailing: DEFAULT_LENGTH };
        }
    } else if (args.length === 2) {
        // .padding(edges, length)
        let edges = args[0];
        let length = args[1];
        if (!(typeof length === 'number' && isFinite(length))) length = DEFAULT_LENGTH;
        if (typeof edges === "string" || Array.isArray(edges)) {
            applyEdges(edges, length, padding);
        }
    }

    // Cleanup & sanitization: NaN/undefined to 0
    for (const key of ["top", "leading", "bottom", "trailing"]) {
        if (typeof padding[key] !== "number" || !isFinite(padding[key])) padding[key] = 0;
    }

    return padding;
}

// Map edge masks, including expansion for composite cases
function applyEdges(mask, length, target) {
    // Mask can be array or string
    if (typeof mask === "string")
        mask = [mask];
    if (!Array.isArray(mask)) return;

    // If "all" is present anywhere, set ALL edges first
    if (mask.includes("all")) {
        target.top = length;
        target.bottom = length;
        target.leading = length;
        target.trailing = length;
        // Don't early-return; individual keys below should override if desired
    }
    for (let edge of mask) {
        switch (edge) {
            case "top":
                target.top = length;
                break;
            case "bottom":
                target.bottom = length;
                break;
            case "leading":
                target.leading = length;
                break;
            case "trailing":
                target.trailing = length;
                break;
            case "horizontal":
                target.leading = length;
                target.trailing = length;
                break;
            case "vertical":
                target.top = length;
                target.bottom = length;
                break;
            // If "all", handled above
        }
    }
}

