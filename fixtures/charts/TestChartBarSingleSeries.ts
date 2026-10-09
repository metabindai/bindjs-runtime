const metadata = {
    title: "TestChartBarSingleSeries",
    description: "Single-series bar chart with axis titles. Two bars (Jan 12, Feb 18) with visible axes titled \"Month\" (x) and \"Revenue\" (y)."
};

const REVENUE = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 18 }
];

const body = () => (
    Chart({}, [
        ForEach(REVENUE, row => (
            BarMark({ x: { value: row.month, label: "Month" }, y: { value: row.value, label: "Revenue" } })
        ))
    ])
        .chartXAxisLabel("Month")
        .chartYAxisLabel("Revenue")
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
