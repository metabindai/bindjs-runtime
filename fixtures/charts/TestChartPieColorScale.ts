const metadata = {
    title: "TestChartPieColorScale",
    description: "Pie chart using foregroundStyle series keys and a color scale. Slices Product 45 (blue), Services 35 (green) and Support 20 (orange), with a matching legend."
};

const body = () => (
    PieChart({}, [
        PieSliceMark({ id: "product", value: 45, label: "Product" }).foregroundStyle({ by: "Product" }),
        PieSliceMark({ id: "services", value: 35, label: "Services" }).foregroundStyle({ by: "Services" }),
        PieSliceMark({ id: "support", value: 20, label: "Support" }).foregroundStyle({ by: "Support" })
    ])
        .chartForegroundStyleScale({ Product: "blue", Services: "green", Support: "orange" })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
