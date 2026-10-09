const metadata = {
    title: "DaveTest1",
    description: "A 300x300 Bauhaus-style composition on a cream square, built from offset shapes in a ZStack: a large red circle upper left, a tall yellow rectangle right, a dark blue square rotated 45 degrees lower left, black horizontal and vertical bars, a thin black accent line and a small black circle top right."
};

const body = () => {
    return (
        ZStack({ alignment: "center" }, [
            // Cream background
            Rectangle()
                .fill(Color("#F5F0E1"))
                .frame({ width: 300, height: 300 }),
            // Large red circle - primary Bauhaus element
            Circle()
                .fill(Color("#C41E3A"))
                .frame({ width: 120, height: 120 })
                .offset({ x: -60, y: -50 }),
            // Yellow rectangle - geometric contrast
            Rectangle()
                .fill(Color("#F4C430"))
                .frame({ width: 80, height: 140 })
                .offset({ x: 70, y: 20 }),
            // Blue diamond: a square rotated 45 degrees
            Rectangle()
                .fill(Color("#1E3A8A"))
                .frame({ width: 70, height: 70 })
                .rotationEffect(45)
                .offset({ x: -30, y: 70 }),
            // Black horizontal bar
            Rectangle()
                .fill(Color("black"))
                .frame({ width: 200, height: 4 })
                .offset({ x: 0, y: -100 }),
            // Black vertical bar
            Rectangle()
                .fill(Color("black"))
                .frame({ width: 4, height: 180 })
                .offset({ x: 20, y: 20 }),
            // Small black accent circle
            Circle()
                .fill(Color("black"))
                .frame({ width: 25, height: 25 })
                .offset({ x: 100, y: -80 }),
            // Thin horizontal accent line
            Rectangle()
                .fill(Color("black"))
                .frame({ width: 100, height: 2 })
                .offset({ x: -80, y: 30 })
        ])
            .frame({ width: 300, height: 300 })
    );
};

export default defineComponent({ metadata, body });
