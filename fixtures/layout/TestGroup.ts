const metadata = {
    title: "TestGroup",
    description: "Group with a single child, a one-element array, and two children sharing modifiers: the first two lines render as plain body text; the last two lines both render bold, title3-sized and blue."
};

const body = () => (
    VStack([
        Group(Text("This is in a group")),
        Group([
            Text("This is also in a group")
        ]),
        Group([
            Text("These should have same modifiers applied"),
            Text("These should have same modifiers applied")
        ])
            .font("title3")
            .foregroundStyle(Color("blue"))
            .bold()
    ])
);

export default defineComponent({ metadata, body });
