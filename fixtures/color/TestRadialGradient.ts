const metadata = {
    title: "TestRadialGradient",
    description: "Exercises RadialGradient as a view with default radii: purple at the center fading out to red in a circle."
};

const body = () => (
    VStack([
        RadialGradient({
            colors: [
                Color("purple"),
                Color("red")
            ]
        })
    ])
);

export default defineComponent({ metadata, body });
