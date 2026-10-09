const metadata = {
    title: "TestButtonStyleModifier",
    description: "A single \"Button Style\" button styled by calling the registered ButtonStyleTest fixture by name; it should render as the blue glossy Aqua pill and darken/shrink slightly while pressed."
};

const body = () => {
    return (
        Button("Button Style", () => {})
            .buttonStyle(ButtonStyleTest())
    );
};

export default defineComponent({ metadata, body });
