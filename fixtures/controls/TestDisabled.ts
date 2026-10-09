const metadata = {
    title: "TestDisabled",
    description: "Two buttons: \"Disabled Button\" with .disabled(true) renders greyed out and does nothing when tapped; \"Button\" with .disabled(false) renders normally and shows a \"not disabled\" alert when tapped."
};

const body = () => {
    return (
        VStack([
            Button({
                label: Text("Disabled Button"),
                action: () => {
                    alert("disabled");
                }
            })
                .disabled(true),
            Button({
                label: Text("Button"),
                action: () => {
                    alert("not disabled");
                }
            })
                .disabled(false)
        ])
    );
};

export default defineComponent({ metadata, body });
