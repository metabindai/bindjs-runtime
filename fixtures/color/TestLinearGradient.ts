const metadata = {
    title: "TestLinearGradient",
    description: "Exercises LinearGradient as a view with default start/end points: two gradients stacked vertically, each filling half the space top-to-bottom - green, red, green, yellow, purple bands, then purple to red."
};

const body = () => {
    const multiStopGradient = (
        LinearGradient({
            colors: [
                Color("green"),
                Color("red"),
                Color("green"),
                Color("yellow"),
                Color("purple")
            ]
        })
    );

    const twoStopGradient = (
        LinearGradient({
            colors: [
                Color("purple"),
                Color("red")
            ]
        })
    );

    return (
        VStack([
            multiStopGradient,
            twoStopGradient
        ])
    );
};

export default defineComponent({ metadata, body });
