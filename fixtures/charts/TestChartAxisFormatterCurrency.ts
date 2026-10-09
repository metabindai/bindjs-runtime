const metadata = {
    title: "TestChartAxisFormatterCurrency",
    description: "Declarative currency formatter on the y-axis. Two bars (Jan 1200, Feb 1800) in a 400×280 chart with y-axis tick labels formatted as whole US dollars (e.g. $1,000, $1,500)."
};

const body = () => (
    Chart({}, [
        BarMark({ x: { value: "Jan" }, y: { value: 1200 } }),
        BarMark({ x: { value: "Feb" }, y: { value: 1800 } })
    ])
        .chartYAxis({ formatter: { style: "currency", currency: "USD", maximumFractionDigits: 0 } })
        .frame({ width: 400, height: 280 })
        .padding(100)
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
