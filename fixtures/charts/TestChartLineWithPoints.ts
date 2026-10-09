const metadata = {
    title: "TestChartLineWithPoints",
    description: "LineMark and PointMark layered per row via Group inside ForEach, with the y-axis on the trailing edge. A Jan–Mar line (12, 18, 14) with a dot at each data point."
};

const VALUES = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 18 },
    { month: "Mar", value: 14 }
];

const body = () => (
    Chart({}, [
        ForEach(VALUES, row => (
            Group([
                LineMark({ x: { value: row.month }, y: { value: row.value } }),
                PointMark({ x: { value: row.month }, y: { value: row.value } })
            ])
        ))
    ])
        .frame({ height: 280 })
        .chartYAxis({ position: "trailing" })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
