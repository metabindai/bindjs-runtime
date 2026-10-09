const metadata = {
    title: "TestChartLineSingle",
    description: "Single-series line chart on a date x-scale. One line rising through Jan, Feb and Mar 2026 (12, 15, 21) with date-formatted x-axis labels."
};

const VALUES = [
    { date: "2026-01-01", value: 12 },
    { date: "2026-02-01", value: 15 },
    { date: "2026-03-01", value: 21 }
];

const body = () => (
    Chart({}, [
        ForEach(VALUES, row => (
            LineMark({ x: { value: row.date, label: "Date" }, y: { value: row.value, label: "Value" } })
        ))
    ])
        .chartXScale({ type: "date" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
