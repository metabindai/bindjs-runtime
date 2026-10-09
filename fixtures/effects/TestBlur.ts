const metadata = {
    title: "TestBlur",
    description: "Exercises .blur(10): a 100x100 blue rounded square rendered with soft, blurred edges."
};

const body = () => (
    RoundedRectangle()
        .fill(Color("blue"))
        .frame({ width: 100, height: 100 })
        .blur(10)
);

export default defineComponent({ metadata, body });
