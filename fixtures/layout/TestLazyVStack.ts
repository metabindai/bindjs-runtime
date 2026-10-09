const metadata = {
    title: "TestLazyVStack",
    description: "LazyVStack with four Text rows: renders \"TestLazyVStack 1\" through \"TestLazyVStack 4\" stacked vertically in order, like a plain VStack."
};

const body = () => (
    LazyVStack([
        Text("TestLazyVStack 1"),
        Text("TestLazyVStack 2"),
        Text("TestLazyVStack 3"),
        Text("TestLazyVStack 4")
    ])
);

export default defineComponent({ metadata, body });
