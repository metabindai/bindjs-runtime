const metadata = {
    title: "TestClipShape",
    description: "A rainbow AngularGradient clipped with .clipShape() to five shapes, stacked: a 250x250 circle, a 250x100 frame clipped to a 100pt circle, a 250x125 ellipse, a 250x50 capsule, and a 250x50 rounded rectangle with 20pt corners."
};

const angular = AngularGradient({
    colors: [
        Color("red"),
        Color("orange"),
        Color("yellow"),
        Color("green"),
        Color("blue"),
        Color("indigo"),
        Color("red")
    ]
});

const body = () => {
    return (
        VStack([
            CircleTest(),
            CircleInsetTest(),
            EllipseTest(),
            CapsuleTest(),
            RoundedRectangleTest()
        ])
    );
};

const CircleTest = () => (
    angular
        .frame({ width: 250, height: 250 })
        .clipShape(Circle())
);

const CircleInsetTest = () => (
    angular
        .frame({ width: 250, height: 100 })
        .clipShape(Circle())
);

const EllipseTest = () => (
    angular
        .frame({ width: 250, height: 125 })
        .clipShape(Ellipse())
);

const CapsuleTest = () => (
    angular
        .frame({ width: 250, height: 50 })
        .clipShape(Capsule())
);

const RoundedRectangleTest = () => (
    angular
        .frame({ width: 250, height: 50 })
        .clipShape(RoundedRectangle({ cornerRadius: 20 }))
);

const thumbnail = () => CircleTest();

const previews = [
    Self().previewName("All shapes"),
    CircleTest().previewName("Circle"),
    CircleInsetTest().previewName("Circle in wide frame"),
    EllipseTest().previewName("Ellipse"),
    CapsuleTest().previewName("Capsule"),
    RoundedRectangleTest().previewName("Rounded rectangle")
];

export default defineComponent({ metadata, body, previews, thumbnail });
