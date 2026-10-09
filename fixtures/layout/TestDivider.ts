const metadata = {
    title: "TestDivider",
    description: "Divider() inside HStacks and a VStack: the HStack rows show three columns split by thin vertical lines, and the middle VStack shows three rows separated by full-width horizontal lines (including one above and below)."
};

const body = () => (
    VStack({ spacing: 0 }, [
        HStack([
            Text("Column 1"),
            Divider(),
            Text("Column 2"),
            Divider(),
            Text("Column 3")
        ]),
        VStack([
            Divider(),
            Text("Row 1"),
            Divider(),
            Text("Row 2"),
            Divider(),
            Text("Row 3"),
            Divider()
        ]),
        HStack([
            Text("Column 1"),
            Divider(),
            Text("Column 2"),
            Divider(),
            Text("Column 3")
        ])
    ])
);

export default defineComponent({ metadata, body });
