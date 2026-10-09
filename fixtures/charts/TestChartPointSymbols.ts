const metadata = {
    title: "TestChartPointSymbols",
    description: "Point symbol, symbol size, annotation and symbol scale on one mark. A single large diamond point at (Jan, 12) labeled \"Peak\" above it, with a \"Region\" legend entry for North."
};

const body = () => (
    Chart({}, [
        PointMark({ x: { value: "Jan", label: "Month" }, y: { value: 12, label: "Revenue" } })
            .foregroundStyle({ by: { value: "North", label: "Region" } })
            .symbol("diamond")
            .symbolSize(96)
            .annotation({ text: "Peak", position: "top" })
    ])
        .chartSymbolScale({ North: "diamond" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
