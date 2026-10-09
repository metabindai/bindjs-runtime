const metadata = {
    title: "TestChartLineWithRule",
    description: "Line chart with a horizontal y-value reference rule. A Jan–Mar line (12, 18, 14) crossed by a red dashed \"Average\" rule at y = 15."
};

const VALUES = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 18 },
    { month: "Mar", value: 14 }
];

const body = () => (
    Chart({}, [
        ForEach(VALUES, row => LineMark({ x: { value: row.month }, y: { value: row.value } })),
        RuleMark({ y: { value: 15, label: "Average" } })
            .foregroundStyle(Color("red"))
            .lineStyle({ dash: [4, 2] })
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
