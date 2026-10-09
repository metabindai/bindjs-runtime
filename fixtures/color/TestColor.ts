const metadata = {
    title: "TestColor",
    description: "Exercises the Color() input formats as views: seven full-width stripes stacked with no gap - primary, secondary and tertiary semantic colours, named blue, short-key RGB blue, long-key RGB blue at 50% alpha, and hex #002266 navy."
};

const body = () => {
    const semanticOne = Color("primary");
    const semanticTwo = Color("secondary");
    const semanticThree = Color("tertiary");
    const namedColor = Color("blue");
    const rgbColor = Color({ r: 0, g: 0, b: 255 });
    const rgbColorWithAlpha = Color({ red: 0, green: 0, blue: 255, alpha: 0.5 });
    const hexColor = Color("#002266");

    return (
        VStack({ spacing: 0 }, [
            semanticOne,
            semanticTwo,
            semanticThree,
            namedColor,
            rgbColor,
            rgbColorWithAlpha,
            hexColor
        ])
    );
};

export default defineComponent({ metadata, body });
