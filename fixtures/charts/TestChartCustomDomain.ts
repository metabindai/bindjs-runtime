const metadata = {
    title: "TestChartCustomDomain",
    description: "Bar chart with an explicit y-domain. Two bars (Jan 42, Feb 64) on a y-axis that runs 0–100, so the taller bar reaches only about two thirds of the plot height."
};

const VALUES = [
    { month: "Jan", value: 42 },
    { month: "Feb", value: 64 }
];

const body = () => (
    Chart({}, [
        ForEach(VALUES, row => BarMark({ x: { value: row.month }, y: { value: row.value } }))
    ])
        .chartYScale({ domain: [0, 100] })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
