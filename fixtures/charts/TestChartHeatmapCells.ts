const metadata = {
    title: "TestChartHeatmapCells",
    description: "RectangleMark heatmap cells on two categorical axes. A red \"High\" cell at (Jan, North) and a blue \"Low\" cell at (Feb, South), with an \"Intensity\" legend."
};

const body = () => (
    Chart({}, [
        RectangleMark({ x: { value: "Jan", label: "Month" }, y: { value: "North", label: "Region" } })
            .foregroundStyle({ by: { value: "High", label: "Intensity" } }),
        RectangleMark({ x: { value: "Feb", label: "Month" }, y: { value: "South", label: "Region" } })
            .foregroundStyle({ by: { value: "Low", label: "Intensity" } })
    ])
        .chartForegroundStyleScale({ High: "red", Low: "blue" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
