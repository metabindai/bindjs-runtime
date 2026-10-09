const metadata = {
    title: "TestGetComponentData",
    description: "Calls getComponentData on a TestDefineComponent instance and prints the result; expect text reading TestGetComponentData {\"name\":\"TestDefineComponent\",\"props\":{}}."
};

const body = () => {
    // Passes the component instance itself (a lazy thunk at runtime). The
    // documented `() => Component` wrapper form currently resolves to { name: null }.
    const data = getComponentData(TestDefineComponent());
    return VStack([
        Text("TestGetComponentData " + JSON.stringify(data))
    ]);
};

export default defineComponent({ metadata, body });
