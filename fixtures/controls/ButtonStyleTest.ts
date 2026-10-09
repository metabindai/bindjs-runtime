const metadata = {
    title: "ButtonStyleTest",
    description: "A shared Aqua-style button style (defineButtonStyle) used by TestButton, TestButtonStyle and TestButtonStyleModifier: a blue glossy gradient pill with a lighter top highlight, a 1pt darker border, bold white label and drop shadow; pressing darkens the gradient, turns the label dark grey and scales it to 98%, hovering brightens the highlight. Rendered on its own it shows the placeholder label \"Button Style\"."
};

const body = ({ label, isPressed }: ButtonStyleConfiguration) => {
    const [isHovering, setHovering] = useState(false);

    const gradientColors = isPressed
        ? [Color("#6B9BD1"), Color("#4A7DB8"), Color("#3A6BA8"), Color("#5588C0")]
        : [Color("#B8D4F1"), Color("#7AB3E8"), Color("#4A90D9"), Color("#6AABE5")];

    const glossyBackground = (
        RoundedRectangle()
            .fill(LinearGradient({
                colors: gradientColors,
                startPoint: "top",
                endPoint: "bottom"
            }))
    );

    // Top glossy highlight (the Aqua signature)
    const highlight = (
        RoundedRectangle()
            .fill(LinearGradient({
                colors: [
                    Color({ r: 1, g: 1, b: 1, a: isHovering ? 0.7 : 0.5 }),
                    Color({ r: 1, g: 1, b: 1, a: 0 })
                ],
                startPoint: "top",
                endPoint: "center"
            }))
    );

    const border = (
        Capsule()
            .stroke({ style: Color(isPressed ? "#2A5A8A" : "#4A7AB8"), lineWidth: 1 })
    );

    const styledLabel = (
        label
            .font("headline")
            .fontWeight("bold")
            .foregroundStyle(Color(isPressed ? "#333333" : "white"))
            .shadow({ radius: isPressed ? 0 : 1, y: -1, color: Color({ r: 0, g: 0, b: 0, a: 0.3 }) })
    );

    return (
        HStack([styledLabel])
            .padding(["horizontal"], 20)
            .padding(["vertical"], 12)
            .background(ZStack([glossyBackground, highlight, border]))
            .shadow({
                radius: isPressed ? 2 : 4,
                y: isPressed ? 1 : 2,
                color: Color({ r: 0, g: 0, b: 0, a: 0.4 })
            })
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .onHover((hovering) => {
                withAnimation(Spring({ response: 0.2, dampingFraction: 0.8 }), () => {
                    setHovering(hovering);
                });
            })
    );
};

export default defineButtonStyle({ metadata, body });
