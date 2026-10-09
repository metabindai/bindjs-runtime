const metadata = {
    title: "TestChartBarMultiSeries",
    description: "Multi-series bars colored by a labeled series channel with an explicit color scale. Jan and Feb each show North (blue) and South (green) segments, stacked by default, with a \"Region\" legend."
};

const SALES = [
    { month: "Jan", region: "North", value: 12 },
    { month: "Jan", region: "South", value: 9 },
    { month: "Feb", region: "North", value: 18 },
    { month: "Feb", region: "South", value: 15 }
];

const body = () => (
    Chart({}, [
        // Side-by-side grouping (SwiftUI's .position(by:)) has no BindJS equivalent, so series stack.
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
