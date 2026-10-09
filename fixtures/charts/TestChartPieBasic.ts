const metadata = {
    title: "TestChartPieBasic",
    description: "Basic pie chart with literal slice values. A full pie with three slices — Product 45%, Services 35%, Support 20% — in default palette colors."
};

const body = () => (
    PieChart({}, [
        PieSliceMark({ id: "product", value: 45, label: "Product" }),
        PieSliceMark({ id: "services", value: 35, label: "Services" }),
        PieSliceMark({ id: "support", value: 20, label: "Support" })
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
