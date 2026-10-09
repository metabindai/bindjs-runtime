const metadata = {
    title: "TestBlendMode",
    description: "Exercises .blendMode(\"difference\"): a red rounded square over an offset blue one; where they overlap the colours combine as a difference blend (magenta) instead of red simply covering blue."
};

const body = () => (
    ZStack([
        RoundedRectangle()
            .fill(Color("blue"))
            .offset({ x: -20, y: 20 })
            .frame({ width: 100, height: 100 }),
        RoundedRectangle()
            .fill(Color("red"))
            .blendMode("difference")
            .frame({ width: 100, height: 100 })
    ])
);

export default defineComponent({ metadata, body });
