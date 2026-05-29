import { colorStyleToCSS } from '../../Styles/ColorStyle';
import { ChartColorScheme } from './ChartCollector';

/**
 * SwiftUI Charts default color cycle. When marks/slices have no explicit
 * foregroundStyle, Swift Charts cycles through these iOS system colors in
 * order. We resolve each name through ColorStyle so dark mode picks the
 * dark variants automatically.
 */
const swiftUIColorCycle: readonly string[] = [
    'blue',
    'green',
    'orange',
    'red',
    'purple',
    'pink',
    'yellow',
    'mint',
    'teal',
    'cyan',
    'indigo',
    'brown',
];

export function defaultChartColorRange(colorScheme?: ChartColorScheme): string[] {
    return swiftUIColorCycle.map((name) => colorStyleToCSS(name as any, undefined, colorScheme) ?? name);
}

export function defaultChartColorAt(index: number, colorScheme?: ChartColorScheme): string {
    const name = swiftUIColorCycle[((index % swiftUIColorCycle.length) + swiftUIColorCycle.length) % swiftUIColorCycle.length];
    return colorStyleToCSS(name as any, undefined, colorScheme) ?? name;
}
