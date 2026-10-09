const metadata = {
    title: "TestChartLegendHidden",
    description: "Multi-series chart with the legend hidden. A single Jan bar stacked North (12) and South (9) in two colors, with no legend shown."
};

const SALES = [
    { month: "Jan", region: "North", value: 12 },
    { month: "Jan", region: "South", value: 9 }
];

const body = () => (
    Chart({}, [
        ForEach(SALES, row => (
            BarMark({ x: { value: row.month }, y: { value: row.value } })
                .foregroundStyle({ by: row.region })
        ))
    ])
        .chartLegend({ hidden: true })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
