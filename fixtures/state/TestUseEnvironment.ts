const metadata = {
    title: "TestUseEnvironment",
    description: "`.environment()` overrides flow to descendants only: the first line (a child component) reads `Other {\"width\":23,\"height\":44}` from the overridden `screen` value, while the second line, read in the parent's own body, shows the real screen size."
};

const body = () => {
    const env = useEnvironment();

    return (
        VStack([
            OtherComponent(),
            Text(JSON.stringify(env.screen))
        ])
            .environment("someValue", 1)
            .environment("screen", { width: 23, height: 44 })
    );
};

const OtherComponent = defineComponent({
    body: () => {
        const env = useEnvironment();
        return Text("Other " + JSON.stringify(env.screen));
    }
});

export default defineComponent({ metadata, body });
