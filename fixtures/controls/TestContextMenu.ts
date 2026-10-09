const metadata = {
    title: "TestContextMenu",
    description: "Three context menus opened by long press / right click: a Text with an array of Copy/Paste/Delete buttons; a photo icon with a Group menu (Save to Photos, Copy Image, divider, red Delete); and a VStack whose menu nests a \"More Options\" submenu (Archive, Export) between Edit/Divider and a divider-separated Delete. Choosing an item logs its name."
};

const body = () => {
    const textWithMenu = (
        Text("Long press me")
            .contextMenu([
                Button({ label: Text("Copy"), action: () => console.log("Copy") }),
                Button({ label: Text("Paste"), action: () => console.log("Paste") }),
                Button({ label: Text("Delete"), action: () => console.log("Delete") })
            ])
    );

    const imageWithMenu = (
        Image({ systemName: "photo" })
            .contextMenu(Group([
                Button({ label: Text("Save to Photos"), action: () => console.log("Save to Photos") }),
                Button({ label: Text("Copy Image"), action: () => console.log("Copy Image") }),
                Divider(),
                Button({ label: Text("Delete"), action: () => console.log("Delete") })
                    .foregroundStyle(Color("red"))
            ]))
    );

    const stackWithNestedMenu = (
        VStack([
            Text("Item with context menu")
        ])
            .contextMenu(Group([
                Button({ label: Text("Edit"), action: () => console.log("Edit") }),
                Button({ label: Text("Divider"), action: () => console.log("Divider") }),
                Menu({ label: Text("More Options") }, [
                    Button({ label: Text("Archive"), action: () => console.log("Archive") }),
                    Button({ label: Text("Export"), action: () => console.log("Export") })
                ]),
                Divider(),
                Button({ label: Text("Delete"), action: () => console.log("Delete") })
            ]))
    );

    return (
        VStack({ spacing: 20 }, [
            textWithMenu,
            Divider(),
            imageWithMenu,
            Divider(),
            stackWithNestedMenu
        ])
    );
};

export default defineComponent({ metadata, body });
