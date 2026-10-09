const metadata = {
    title: "TestChartXSelectionControlled",
    description: "Controlled x-axis selection via chartXSelection({ value, onChange }). Two points (Jan 12, Feb 18) above a \"Selected: Jan\" caption; clicking near a point updates the caption to that point's month."
};

const body = () => {
    const [selected, setSelected] = useState<string | number | null>("Jan");

    const chart = (
        Chart({}, [
            PointMark({ x: { value: "Jan", label: "Month" }, y: { value: 12, label: "Revenue" } }),
            PointMark({ x: { value: "Feb", label: "Month" }, y: { value: 18, label: "Revenue" } })
        ])
            .chartXSelection({ value: selected, onChange: value => setSelected(value) })
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
