const metadata = {
    title: "TestEllipticalGradient",
    description: "Exercises EllipticalGradient as a view: fills the available space with blue at the center fading out to green, stretched to the container's aspect ratio."
};

const body = () => (
    VStack([
        EllipticalGradient({
            colors: [
                Color("blue"),
                Color("green")
            ]
        })
    ])
);

export default defineComponent({ metadata, body });
