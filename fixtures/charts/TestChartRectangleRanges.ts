const metadata = {
    title: "TestChartRectangleRanges",
    description: "RectangleMark range rectangles using x2/y2 secondary channels, in a 600pt-wide VStack. A blue block spanning Jan–Feb × North–South and a green block spanning Feb–Mar × South–West."
};

const body = () => (
    VStack([
        Chart({}, [
            RectangleMark({
                x: { value: "Jan", label: "Start" },
                x2: { value: "Feb", label: "End" },
                y: { value: "North", label: "Start region" },
                y2: { value: "South", label: "End region" }
            })
                .foregroundStyle(Color("blue")),
            RectangleMark({
                x: { value: "Feb", label: "Start" },
                x2: { value: "Mar", label: "End" },
                y: { value: "South", label: "Start region" },
                y2: { value: "West", label: "End region" }
            })
                .foregroundStyle(Color("green"))
        ])
    ])
        .frame({ width: 600 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
