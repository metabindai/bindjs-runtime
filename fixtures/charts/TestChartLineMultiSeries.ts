const metadata = {
    title: "TestChartLineMultiSeries",
    description: "Multi-series line chart on a date x-scale using foregroundStyle({ by }). Two lines over Jan–Feb 2026 — North (12 → 15) and South (8 → 13) — in different colors with a legend."
};

const SALES = [
    { date: "2026-01-01", region: "North", value: 12 },
    { date: "2026-02-01", region: "North", value: 15 },
    { date: "2026-01-01", region: "South", value: 8 },
    { date: "2026-02-01", region: "South", value: 13 }
];

const body = () => (
    Chart({}, [
        ForEach(SALES, row => (
            LineMark({ x: { value: row.date }, y: { value: row.value } })
                .foregroundStyle({ by: row.region })
        ))
    ])
        .chartXScale({ type: "date" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
