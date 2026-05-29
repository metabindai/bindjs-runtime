export function Color({ args }) {

    const [props] = args ?? [];

    let colorProps;
    // If input is null, undefined, or empty object, return black
    if (props == null || (typeof props === 'object' && Object.keys(props).length === 0)) {
        colorProps = { r: 0, g: 0, b: 0, a: 1 };
    } else {
        // Normalize the color input
        colorProps = normalizeColor(props);
    }
    

    return { props: colorProps, children: [] }
}

function isHexColor(value) {
    return typeof value === 'string' && value.startsWith('#');
}

function isNamedColor(value) {
    return typeof value === 'string' && !isHexColor(value)
}

// Utility to parse hex to rgba
function hexToRgba(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    } else if (hex.length === 4) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
    }
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 6) {
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);
        a = parseInt(hex.substring(6,8), 16) / 255;
    }
    return { r, g, b, a };
}

// Utility to convert HSB/HSV to RGB
function hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    let c = v * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - c;
    let r1 = 0, g1 = 0, b1 = 0;
    if (h < 60)      { r1 = c; g1 = x; b1 = 0; }
    else if (h < 120){ r1 = x; g1 = c; b1 = 0; }
    else if (h < 180){ r1 = 0; g1 = c; b1 = x; }
    else if (h < 240){ r1 = 0; g1 = x; b1 = c; }
    else if (h < 300){ r1 = x; g1 = 0; b1 = c; }
    else             { r1 = c; g1 = 0; b1 = x; }
    return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255)
    };
}

// The color normalization logic
function normalizeColor(input) {
    // Handle null/undefined/empty
    if (input == null || (typeof input === 'object' && Object.keys(input).length === 0)) {
        return { r: 0, g: 0, b: 0, a: 1 };
    }
    // Handle number as ARGB integer
    if (typeof input === 'number' && isFinite(input)) {
        // ARGB: 0xAARRGGBB or 0xRRGGBB
        let n = input >>> 0;
        let a, r, g, b;
        if (n > 0xffffff) {
            a = ((n >> 24) & 0xff) / 255;
            r = (n >> 16) & 0xff;
            g = (n >> 8) & 0xff;
            b = n & 0xff;
        } else {
            a = 1;
            r = (n >> 16) & 0xff;
            g = (n >> 8) & 0xff;
            b = n & 0xff;
        }
        return { r, g, b, a };
    }
    // Handle string
    if (typeof input === 'string') {
        if (input === 'clear' || input === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
        if (isHexColor(input)) {
            return hexToRgba(input);
        }
        // Named/semantic color
        if (isNamedColor(input)) {
            return { rawValue: input };
        }
        // fallback: return as-is
        return { rawValue: input };
    } else if (typeof input === 'object' && input !== null) {
        // Handle both short and long HSB/HSV keys (not HSL)
        // Only process if 'b' or 'brightness' is present, not 'l'
        const hasShortHSB = 'h' in input && 's' in input && 'b' in input;
        const hasLongHSB = 'hue' in input && 'saturation' in input && 'brightness' in input;
        if (hasShortHSB || hasLongHSB) {
            let h = input.h ?? input.hue ?? 0;
            let s = input.s ?? input.saturation ?? 0;
            let v = input.b ?? input.brightness ?? 0;
            let a = input.a ?? input.alpha;
            // s/v in 0-1 or 0-100
            if (s > 1) s = s / 100;
            if (v > 1) v = v / 100;
            const rgb = hsvToRgb(h, s, v);
            return { ...rgb, a: a !== undefined ? a : 1 };
        }
        // Handle both short and long RGB keys, but only if not all of h, s, b are present
        const hasShortRGB = ('r' in input || 'g' in input || 'b' in input) && !(('h' in input) && ('s' in input) && ('b' in input));
        const hasLongRGB = ('red' in input || 'green' in input || 'blue' in input) && !(('hue' in input) && ('saturation' in input) && ('brightness' in input));
        if (hasShortRGB || hasLongRGB) {
            let r = input.r ?? input.red ?? 0;
            let g = input.g ?? input.green ?? 0;
            let b = input.b ?? input.blue ?? 0;
            let a = input.a ?? input.alpha;
            // If r/g/b in 0-1, scale to 0-255
            if (r <= 1 && g <= 1 && b <= 1) {
                r = Math.round(r * 255);
                g = Math.round(g * 255);
                b = Math.round(b * 255);
            }
            return { r, g, b, a: a !== undefined ? a : 1 };
        }
        // Handle { opacity } or { a } as alpha for black
        if (
            (Object.keys(input).length === 1 && ('opacity' in input || 'a' in input)) ||
            (Object.keys(input).length === 2 && 'opacity' in input && 'a' in input)
        ) {
            let alpha = input.opacity ?? input.a;
            return { r: 0, g: 0, b: 0, a: alpha };
        }
    }
    // fallback: return as-is
    return { rawValue: input };
}
