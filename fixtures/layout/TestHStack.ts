const metadata = {
    title: "TestHStack",
    description: "HStack spacing, Spacer distribution and vertical alignment: rows of 20pt blue circles packed left, pushed apart or evenly distributed by Spacers, then rows of equal-width blue bars, and three 100pt-spaced pairs on a grey band aligned bottom, top and centre."
};

const testCircle = Ellipse().fill(Color("blue")).frame({ width: 20, height: 20 });
const testRect = RoundedRectangle({ cornerRadius: 5 }).fill(Color("blue"));

const body = () => (
    VStack([
        HStack([
            testCircle,
            testCircle
        ]),
        HStack([
            testCircle,
            Spacer(),
            testCircle
        ]),
        HStack([
            testCircle,
            Spacer(),
            testCircle,
            Spacer(),
            testCircle
        ]),
        HStack([
            Spacer(),
            testCircle,
            Spacer(),
            testCircle,
            Spacer(),
            testCircle,
            Spacer()
        ]),
        HStack([
            Spacer(),
            testCircle
        ]),
        HStack([
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 20 })
        ]),
        HStack([
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 20 })
        ]),
        HStack({ spacing: 100 }, [
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 20 })
        ]),
        HStack({ spacing: 100, alignment: "bottom" }, [
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 100 })
        ])
            .background(Color("black").opacity(0.1)),
        HStack({ spacing: 100, alignment: "top" }, [
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 100 })
        ])
            .background(Color("black").opacity(0.1)),
        HStack({ spacing: 100, alignment: "center" }, [
            testRect.frame({ height: 20 }),
            testRect.frame({ height: 100 })
        ])
            .background(Color("black").opacity(0.1))
    ])
);

const thumbnail = () => (
    HStack([
        Spacer(),
        testCircle,
        Spacer(),
        testCircle,
        Spacer(),
        testCircle,
        Spacer()
    ])
);

export default defineComponent({ metadata, body, thumbnail });
