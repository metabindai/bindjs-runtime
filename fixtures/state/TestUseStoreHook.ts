const metadata = {
    title: "TestUseStoreHook",
    description: "Global useStore state shared with TestUseStoreHookOther: tap the first line to increment the shared \"test1\" value, the second to set the shared \"test2\" name to \"World\", and the third to replace the \"test3\" store (scope \"categories\", isolated from the other fixture's \"products\" scope) with value \"x\"."
};

const body = () => {
    const store = useStore("test1", { value: 1 });
    const otherStore = useStore("test2", { name: "Hello" });
    const storeScope = useStore("test3", { value: "a" }, "categories");

    return (
        VStack([
            Text("useStore " + store.value)
                .onTapGesture(() => {
                    store.setValue(store.value + 1);
                }),
            Text("useStore 2 " + JSON.stringify(otherStore))
                .onTapGesture(() => {
                    otherStore.setName("World");
                }),
            Text("useStore Scope " + storeScope.value)
                .onTapGesture(() => {
                    storeScope.set({ value: "x" });
                })
        ])
    );
};

export default defineComponent({ metadata, body });
