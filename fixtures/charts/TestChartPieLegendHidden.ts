const metadata = {
    title: "TestChartPieLegendHidden",
    description: "Pie chart with the legend hidden. Two slices, North 40% (blue) and South 60% (green), with no legend shown."
};

const body = () => (
    PieChart({}, [
        PieSliceMark({ id: "north", value: 40, label: "North" }).foregroundStyle({ by: "North" }),
        PieSliceMark({ id: "south", value: 60, label: "South" }).foregroundStyle({ by: "South" })
    ])
        .chartForegroundStyleScale({ North: "blue", South: "green" })
        .chartLegend({ hidden: true })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
