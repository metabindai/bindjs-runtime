const chartModifierTypes = new Set([
    'chartXAxis',
    'chartYAxis',
    'chartXScale',
    'chartYScale',
    'chartForegroundStyleScale',
    'chartSelection',
    'chartSymbolScale',
    'chartXSelection',
    'chartYSelection',
    'chartLegend',
    'chartXAxisLabel',
    'chartYAxisLabel',
    'lineStyle',
    'interpolationMethod',
    'symbol',
    'symbolSize',
    'annotation',
    'accessibilityLabel',
    'accessibilityHint',
    'accessibilityValue'
]);

const chartRootModifierTypes = new Set([
    'chartXAxis',
    'chartYAxis',
    'chartXScale',
    'chartYScale',
    'chartForegroundStyleScale',
    'chartSelection',
    'chartSymbolScale',
    'chartXSelection',
    'chartYSelection',
    'chartLegend',
    'chartXAxisLabel',
    'chartYAxisLabel',
    'accessibilityLabel',
    'accessibilityHint',
    'accessibilityValue'
]);

function modifiedBaseType(element) {
    let current = element;
    while (current?.type === 'ModifiedComponent') {
        const content = current.props?.content;
        if (!Array.isArray(content) || content.length !== 1) return current.type;
        current = content[0];
    }
    return current?.type;
}

export function shouldApplyChartModifierContext(modifierType, element) {
    if (!chartModifierTypes.has(modifierType)) return true;
    if (!chartRootModifierTypes.has(modifierType)) return false;
    const baseType = modifiedBaseType(element);
    return baseType === 'Chart' || baseType === 'PieChart';
}
