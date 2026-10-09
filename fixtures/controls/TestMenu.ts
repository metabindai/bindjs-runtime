const metadata = {
    title: "TestMenu",
    description: "A Menu labelled \"Hello\"; opening it shows two items: a plain \"Menu Option 1\" and a Label item \"Hello\" with an info.circle.fill icon."
};

const body = () => {
    return (
        Menu({ label: Text("Hello") }, [
            Button({
                label: Text("Menu Option 1"),
                action: () => {}
            }),
            Button({
                label: Label({ systemImage: "info.circle.fill", title: Text("Hello") }),
                action: () => {}
            })
        ])
    );
};

export default defineComponent({ metadata, body });
