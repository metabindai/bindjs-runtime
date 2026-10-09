const metadata = {
    title: "TestChartSymbolScaleSeries",
    description: "Symbol scale covering every portable symbol. Six points Jan–Jun rising from 10 to 20, drawn as circle, square, diamond, triangle, plus and cross respectively, each in its own series color."
};

const POINTS = [
    { month: "Jan", symbol: "circle", value: 10 },
    { month: "Feb", symbol: "square", value: 12 },
    { month: "Mar", symbol: "diamond", value: 14 },
    { month: "Apr", symbol: "triangle", value: 16 },
    { month: "May", symbol: "plus", value: 18 },
    { month: "Jun", symbol: "cross", value: 20 }
];

const body = () => (
    Chart({}, [
        ForEach(POINTS, row => (
            PointMark({ x: { value: row.month }, y: { value: row.value } })
                .foregroundStyle({ by: { value: row.symbol, label: "Symbol" } })
        ))
    ])
        .chartSymbolScale({
            circle: "circle",
            square: "square",
            diamond: "diamond",
            triangle: "triangle",
            plus: "plus",
            cross: "cross"
        })
        .frame({ height: 280 })
);

const previews = [
    Self().previewName("Default")
];

export default defineComponent({ metadata, body, previews });
