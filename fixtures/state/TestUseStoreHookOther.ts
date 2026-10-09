const metadata = {
    title: "TestUseStoreHookOther",
    description: "Companion to TestUseStoreHook using the same \"test1\"/\"test2\" store keys: changes made in one fixture show up in the other. Tap to increment \"test1\", set the \"test2\" name to \"Daveo\", or set the \"test3\" value (scope \"products\", independent of the \"categories\" scope) to \"b\" via its per-field setter."
};

const body = () => {
    const store = useStore("test1", { value: 1 });
    const otherStore = useStore("test2", { name: "Dave" });
    const storeScope = useStore("test3", { value: "a" }, "products");

    return (
        VStack([
            Text("useStore " + store.value)
                .onTapGesture(() => {
                    store.setValue(store.value + 1);
                }),
            Text("useStore 2 " + JSON.stringify(otherStore))
                .onTapGesture(() => {
                    otherStore.setName("Daveo");
                }),
            Text("useStore Scope " + storeScope.value)
                .onTapGesture(() => {
                    storeScope.setValue("b");
                })
        ])
    );
};

export default defineComponent({ metadata, body });
