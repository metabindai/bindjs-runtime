const metadata = {
    title: "TestChartPieSelectionControlled",
    description: "Controlled single-slice pie selection via chartSelection({ value, onChange }). A three-slice pie (Product 45, Services 35, Support 20) above a \"Selected: product\" caption; tapping a slice updates the caption to that slice's id."
};

const body = () => {
    const [selected, setSelected] = useState<string | null>("product");

    const chart = (
        PieChart({}, [
            PieSliceMark({ id: "product", value: 45, label: "Product" }),
            PieSliceMark({ id: "services", value: 35, label: "Services" }),
            PieSliceMark({ id: "support", value: 20, label: "Support" })
        ])
            .chartSelection({ value: selected, onChange: value => setSelected(value) })
            .frame({ height: 280 })
    );

    return (
        VStack({ spacing: 12 }, [
            chart,
            Text(`Selected: ${selected ?? "none"}`).font("caption").foregroundStyle(Color("secondary"))
        ])
    );
};

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
