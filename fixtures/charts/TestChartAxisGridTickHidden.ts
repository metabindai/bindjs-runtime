const metadata = {
    title: "TestChartAxisGridTickHidden",
    description: "Declarative axis label, tick and grid visibility. A Jan–Feb line where the x-axis keeps its labels but has no tick marks or vertical grid lines, and the y-axis shows no tick labels."
};

const body = () => (
    Chart({}, [
        LineMark({ x: { value: "Jan" }, y: { value: 12 } }),
        LineMark({ x: { value: "Feb" }, y: { value: 18 } })
    ])
        .chartXAxis({ ticksHidden: true, gridHidden: true })
        .chartYAxis({ labelsHidden: true })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
