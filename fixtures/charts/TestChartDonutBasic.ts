const metadata = {
    title: "TestChartDonutBasic",
    description: "Donut chart using a normalized innerRadius of 0.55. Three slices (North 40, South 25, West 35) arranged as a ring with a hole a little over half the radius."
};

const body = () => (
    PieChart({ innerRadius: 0.55 }, [
        PieSliceMark({ id: "north", value: 40, label: "North" }),
        PieSliceMark({ id: "south", value: 25, label: "South" }),
        PieSliceMark({ id: "west", value: 35, label: "West" })
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
