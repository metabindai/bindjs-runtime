const metadata = {
    title: "TestChartAxisExplicitValues",
    description: "Explicit x-axis values and top axis position. A Jan–Mar revenue line (12, 18, 14) with the x-axis labels Jan, Feb, Mar drawn along the top edge of the plot."
};

const REVENUE = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 18 },
    { month: "Mar", value: 14 }
];

const body = () => (
    Chart({}, [
        ForEach(REVENUE, row => (
            LineMark({ x: { value: row.month, label: "Month" }, y: { value: row.value, label: "Revenue" } })
        ))
    ])
        .chartXAxis({ values: ["Jan", "Feb", "Mar"], position: "top" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
