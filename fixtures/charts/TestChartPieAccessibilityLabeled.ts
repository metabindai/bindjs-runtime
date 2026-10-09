const metadata = {
    title: "TestChartPieAccessibilityLabeled",
    description: "Pie chart and per-slice accessibility label/value. Two slices (Product 45, Services 35); a screen reader announces the chart as \"Revenue share\" and each slice with its label and percent value."
};

const body = () => (
    PieChart({}, [
        PieSliceMark({ id: "product", value: 45, label: "Product" })
            .accessibilityLabel("Product revenue share")
            .accessibilityValue("45 percent"),
        PieSliceMark({ id: "services", value: 35, label: "Services" })
            .accessibilityLabel("Services revenue share")
            .accessibilityValue("35 percent")
    ])
        .accessibilityLabel("Revenue share")
        .accessibilityHint("Pie chart of revenue by business line")
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
