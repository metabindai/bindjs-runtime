const metadata = {
    title: "TestChartXRuleReference",
    description: "Vertical x-value reference rule. Two bars (Jan 12, Feb 18) with a red dashed \"Release\" rule drawn vertically through Feb."
};

const body = () => (
    Chart({}, [
        BarMark({ x: { value: "Jan" }, y: { value: 12 } }),
        BarMark({ x: { value: "Feb" }, y: { value: 18 } }),
        RuleMark({ x: { value: "Feb", label: "Release" } })
            .foregroundStyle(Color("red"))
            .lineStyle({ dash: [4, 2] })
    ])
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
