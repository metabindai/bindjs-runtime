const metadata = {
    title: "TestChartBarStackedSeries",
    description: "Stacked bars with a labeled series channel and a color scale. Jan (21) and Feb (33) bars each stacked North (blue) under South (green), with a \"Region\" legend."
};

const SALES = [
    { month: "Jan", region: "North", value: 12 },
    { month: "Jan", region: "South", value: 9 },
    { month: "Feb", region: "North", value: 18 },
    { month: "Feb", region: "South", value: 15 }
];

const body = () => (
    Chart({}, [
        ForEach(SALES, row => (
            BarMark({ x: { value: row.month, label: "Month" }, y: { value: row.value, label: "Revenue" } })
                .foregroundStyle({ by: { value: row.region, label: "Region" } })
        ))
    ])
        .chartForegroundStyleScale({ North: "blue", South: "green" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
