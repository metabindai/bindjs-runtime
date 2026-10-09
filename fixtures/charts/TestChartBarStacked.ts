const metadata = {
    title: "TestChartBarStacked",
    description: "Explicitly stacked bars colored by an unlabeled series key, inside a 500×280 VStack. Jan totals 21 and Feb totals 33, each split into North and South segments in default palette colors."
};

const SALES = [
    { month: "Jan", region: "North", value: 12 },
    { month: "Jan", region: "South", value: 9 },
    { month: "Feb", region: "North", value: 18 },
    { month: "Feb", region: "South", value: 15 }
];

const body = () => (
    VStack([
        Chart({}, [
            ForEach(SALES, row => (
                BarMark({ x: { value: row.month }, y: { value: row.value }, stacking: "standard" })
                    .foregroundStyle({ by: row.region })
            ))
        ])
            .frame({ width: 500, height: 280 })
    ])
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
