const metadata = {
    title: "TestChartMarkTextAnnotation",
    description: "Text-only mark annotation. A Jan line mark at 12 and a Feb point at 18 with the text \"Peak\" drawn just above the Feb point."
};

const body = () => (
    Chart({}, [
        LineMark({ x: { value: "Jan" }, y: { value: 12 } }),
        PointMark({ x: { value: "Feb" }, y: { value: 18 } })
            .annotation({ text: "Peak", position: "top" })
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
