const metadata = {
    title: "TestChartInterpolationMonotone",
    description: "Line chart using monotone interpolation. A Jan–Mar line (12, 18, 14) drawn as a smooth curve that peaks at Feb without overshooting it."
};

const VALUES = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 18 },
    { month: "Mar", value: 14 }
];

const body = () => (
    Chart({}, [
        ForEach(VALUES, row => (
            LineMark({ x: { value: row.month }, y: { value: row.value } })
                .interpolationMethod("monotone")
        ))
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
