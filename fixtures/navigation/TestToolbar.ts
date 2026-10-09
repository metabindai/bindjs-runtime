const metadata = {
    title: "TestToolbar",
    description: "Toolbar placements inside a NavigationStack titled \"Hello\": an info button at the leading and trailing ends of the navigation bar, and two info buttons at either end of a bottom bar, around a red-backed \"TestToolbar\" label."
};

const body = () => {
    const button = Button({ label: Image({ systemName: "info.circle.fill" }), action: () => {} });

    return (
        NavigationStack([
            VStack([
                Text("TestToolbar")
            ])
                .background(Color("red"))
                .toolbar([
                    ToolbarItem({ placement: "navigationBarLeading" }, [
                        button
                    ]),
                    ToolbarItemGroup({ placement: "bottomBar" }, [
                        button,
                        Spacer(),
                        button
                    ]),
                    ToolbarItem({ placement: "navigationBarTrailing" }, [
                        button
                    ])
                ])
                .navigationTitle("Hello")
        ])
    );
};

export default defineComponent({ metadata, body });
