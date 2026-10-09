const metadata = {
    title: "TestChartHiddenAxis",
    description: "Line chart with the x-axis hidden. A Jan–Feb line rising from 12 to 18 with a visible y-axis but no x-axis line, ticks or labels."
};

const VALUES = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 18 }
];

const body = () => (
    Chart({}, [
        ForEach(VALUES, row => LineMark({ x: { value: row.month }, y: { value: row.value } }))
    ])
        .chartXAxis({ hidden: true })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
