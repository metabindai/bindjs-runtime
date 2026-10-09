const metadata = {
    title: "TestRuntimeComponent2",
    description: "Calls another registered fixture (TestRuntimeComponent1) by name six times; expect a vertical column of six 40×40 red squares."
};

const body = () => {
    return (
        VStack([
            TestRuntimeComponent1(),
            TestRuntimeComponent1(),
            TestRuntimeComponent1(),
            TestRuntimeComponent1(),
            TestRuntimeComponent1(),
            TestRuntimeComponent1()
        ])
    );
};

export default defineComponent({ metadata, body });
