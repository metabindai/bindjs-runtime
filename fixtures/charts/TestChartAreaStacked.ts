const metadata = {
    title: "TestChartAreaStacked",
    description: "Stacked AreaMark series. Two filled areas (North, South) across Jan–Feb, South stacked on top of North so the top edge reaches 21 at Jan and 33 at Feb, with a two-entry legend."
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
            AreaMark({ x: { value: row.month }, y: { value: row.value }, stacking: "standard" })
                .foregroundStyle({ by: row.region })
        ))
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
