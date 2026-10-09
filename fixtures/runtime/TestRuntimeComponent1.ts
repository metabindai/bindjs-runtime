const metadata = {
    title: "TestRuntimeComponent1",
    description: "Minimal registered component used by TestRuntimeComponent2: a single 40×40 red square."
};

const body = () => {
    return VStack([
        Rectangle().fill(Color("red")).frame({ width: 40, height: 40 })
    ]);
};

export default defineComponent({ metadata, body });
