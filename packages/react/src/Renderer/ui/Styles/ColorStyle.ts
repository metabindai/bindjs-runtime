// RGB color model
interface RGBColor {
    r: number;
    g?: number;
    b?: number;
    a?: number;
}

// HSL color model
interface HSLColor {
    h: number;
    s?: number;
    l?: number;
    a?: number;
}

// Named color string literals
export type NamedColor =
    | "clear"
    | "red" | "orange" | "yellow" | "green" | "mint" | "teal" | "cyan"
    | "blue" | "indigo" | "purple" | "pink" | "brown" | "black" | "white" | "gray"
    | "primary" | "secondary" | "tertiary" | "quaternary" | "accent" | "background";

// Hex string color (e.g. "#ff0033")
export type HexColor = `#${string}`;

/**
 * Union type representing any accepted color style.
 */
export type ColorStyle = RGBColor | HSLColor | NamedColor | HexColor | number;

/**
 * Guard functions to check if a value is of a specific color type.
 */
function isRGBColor(value: any): value is RGBColor {
    return value && typeof value === 'object' && 'r' in value;
}

function isHSLColor(value: any): value is HSLColor {
    return value && typeof value === 'object' && 'h' in value;
}

function isHexColor(value: any): value is HexColor {
    return typeof value === 'string' && value.startsWith('#');
}

function isNamedColor(value: any): value is NamedColor {
    return typeof value === 'string' && (
        value in iosNamedColors || value in iosSemanticColors
    );
}

/**
 * Generate a CSS color string from a flexible ColorStyle input.
 * Handles RGB, HSL, named, hex, and numeric values.
 */
export function colorStyleToCSS(color: ColorStyle, opacity?: number | undefined, colorScheme?: "light" | "dark" | undefined): string | undefined {
    if (color == null) return undefined;
    
    if (isRGBColor(color)) {
        // Assume r, g, b are already normalized to 0-255
        const r = Math.round(color.r ?? 0);
        const g = Math.round(color.g ?? 0);
        const b = Math.round(color.b ?? 0);
        const a = color.a ?? 1.0;
        return `rgba(${r}, ${g}, ${b}, ${opacity ?? a})`;
    }

    if (typeof color === 'string') {
        if (iosNamedColors[color])    return namedColorToCSS(color, { opacity, colors: iosNamedColors, darkColors: iosNamedColorsDark, colorScheme: colorScheme });
        if (iosSemanticColors[color]) return namedColorToCSS(color, { opacity, colors: iosSemanticColors, darkColors: iosSemanticColorsDark, colorScheme: colorScheme });

        return color;
    }

    return `rgba(0, 0, 0,  ${opacity ?? 1.0})`;
}


type RGB = { r: number; g: number; b: number, a?: number };
type NamedColorMap = Record<string, RGB>;

/**
 * Returns a named color from a color map as a CSS rgba() string.
 *
 * @param name - The name of the color (e.g., 'red', 'gray3', 'clear')
 * @param options - Options object:
 *   - `opacity` (optional): Overrides the default alpha (defaults to 1 or 0 for 'clear')
 *   - `colors` (optional): A custom color map to use (defaults to `defaultIosColors`)
 * @returns A CSS rgba(...) string or undefined if the name is not found
 */
function namedColorToCSS(
    name: string,
    {
        opacity,
        colors = iosNamedColors,
        darkColors = iosNamedColors,
        colorScheme
    }: { opacity?: number; colors?: NamedColorMap, darkColors?: NamedColorMap, colorScheme?: "light" | "dark" | undefined } = {}
): string | undefined {
    const color = colorScheme == "dark" ? darkColors[name] : colors[name];
    if (!color) return undefined;

    const a = opacity ?? (name === 'clear' ? 0 : 1);
    const finalAlpha = color.a != undefined ? color.a * a : a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${finalAlpha})`;
}

const iosNamedColors: NamedColorMap = {
    clear: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 59, b: 48 },
    orange: { r: 255, g: 149, b: 0 },
    yellow: { r: 255, g: 204, b: 0 },
    green: { r: 52, g: 199, b: 89 },
    mint: { r: 0, g: 199, b: 190 },
    teal: { r: 48, g: 176, b: 199 },
    cyan: { r: 50, g: 173, b: 230 },
    blue: { r: 0, g: 122, b: 255 },
    indigo: { r: 88, g: 86, b: 214 },
    purple: { r: 175, g: 82, b: 222 },
    pink: { r: 255, g: 45, b: 85 },
    brown: { r: 162, g: 132, b: 94 },
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    gray: { r: 142, g: 142, b: 147 },
    gray2: { r: 174, g: 174, b: 178 },
    gray3: { r: 199, g: 199, b: 204 },
    gray4: { r: 209, g: 209, b: 214 },
    gray5: { r: 229, g: 229, b: 234 },
    gray6: { r: 242, g: 242, b: 247 }
};

const iosNamedColorsDark: NamedColorMap = {
    clear: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 69, b: 58 },
    orange: { r: 255, g: 159, b: 10 },
    yellow: { r: 255, g: 214, b: 10 },
    green: { r: 48, g: 209, b: 88 },
    mint: { r: 102, g: 212, b: 207 },
    teal: { r: 64, g: 200, b: 224 },
    cyan: { r: 100, g: 210, b: 255 },
    blue: { r: 10, g: 132, b: 255 },
    indigo: { r: 94, g: 92, b: 230 },
    purple: { r: 191, g: 90, b: 242 },
    pink: { r: 255, g: 55, b: 95 },
    brown: { r: 172, g: 142, b: 104 },
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    gray: { r: 142, g: 142, b: 147 },
    gray2: { r: 99, g: 99, b: 102 },
    gray3: { r: 72, g: 72, b: 74 },
    gray4: { r: 58, g: 58, b: 60 },
    gray5: { r: 44, g: 44, b: 46 },
    gray6: { r: 28, g: 28, b: 30 }
};

const iosSemanticColors: NamedColorMap = {
    primary:     { r: 0,   g: 0,   b: 0,   a: 1.0 }, // UIColor.label
    secondary:   { r: 60,  g: 60,  b: 67,  a: 0.6 }, // UIColor.secondaryLabel
    tertiary:    { r: 60,  g: 60,  b: 67,  a: 0.3 }, // UIColor.tertiaryLabel
    quaternary:  { r: 60,  g: 60,  b: 67,  a: 0.18 }, // UIColor.quaternaryLabel
    accent:      { r: 0,   g: 122, b: 255, a: 1.0 }, // systemBlue
    background:  { r: 255, g: 255, b: 255, a: 1.0 }  // systemBackground
};

const iosSemanticColorsDark: NamedColorMap = {
    primary:     { r: 255, g: 255, b: 255, a: 1.0 }, // UIColor.label
    secondary:   { r: 235, g: 235, b: 245, a: 0.6 }, // UIColor.secondaryLabel
    tertiary:    { r: 235, g: 235, b: 245, a: 0.3 }, // UIColor.tertiaryLabel
    quaternary:  { r: 235, g: 235, b: 245, a: 0.18 }, // UIColor.quaternaryLabel
    accent:      { r: 10,  g: 132, b: 255, a: 1.0 }, // systemBlue
    background:  { r: 0,   g: 0,   b: 0,   a: 1.0 }  // systemBackground
};
