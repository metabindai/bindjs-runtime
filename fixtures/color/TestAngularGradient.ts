const metadata = {
    title: "TestAngularGradient",
    description: "Exercises AngularGradient as a view: fills the available space with a colour wheel sweeping red, orange, yellow, green, blue, indigo and back to red around the center."
};

const body = () => (
    VStack([
        AngularGradient({
            colors: [
                Color("red"),
                Color("orange"),
                Color("yellow"),
                Color("green"),
                Color("blue"),
                Color("indigo"),
                Color("red")
            ]
        })
    ])
);

export default defineComponent({ metadata, body });
