const metadata = {
    title: "TestChartAccessibilityLabeled",
    description: "Chart-level and mark-level accessibility label/hint. Renders a single Jan bar at 12; a screen reader announces the chart as \"Revenue by month\" and the bar as \"January revenue\"."
};

const body = () => (
    Chart({}, [
        BarMark({ x: { value: "Jan" }, y: { value: 12 } })
            .accessibilityLabel("January revenue")
    ])
        .accessibilityLabel("Revenue by month")
        .accessibilityHint("Bar chart of monthly revenue")
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
