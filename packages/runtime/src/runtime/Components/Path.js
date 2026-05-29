export function PathComponent({ args }) {
    const callback = args[0];
    const elements = [];

    const pathBuilder = {
        move(x, y) { elements.push({ op: "move", x, y }) },
        line(x, y) { elements.push({ op: "line", x, y }) },
        quadCurve(x, y, controlX, controlY) {
            elements.push({ op: "quadCurve", x, y, controlX, controlY })
        },
        curve(x, y, control1X, control1Y, control2X, control2Y) {
            elements.push({ op: "curve", x, y, control1X, control1Y, control2X, control2Y })
        },
        arc(props) { elements.push({ op: "arc", ...props }) },
        addRect(x, y, width, height) {
            elements.push({ op: "rect", x, y, width, height })
        },
        addRoundedRect(props) {
            elements.push({ op: "roundedRect", ...props })
        },
        addEllipse(x, y, width, height) {
            elements.push({ op: "ellipse", x, y, width, height })
        },
        addLines(points) {
            elements.push({ op: "lines", points })
        },
        close() { elements.push({ op: "close" }) }
    };

    if (typeof callback === 'function') {
        callback(pathBuilder);
    }

    return { props: { elements } };
}
