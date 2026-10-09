const metadata = {
    title: "TestButtonStyle",
    description: "Four buttons styled via .buttonStyle(): two local defineButtonStyle styles (white label, 20pt padding, rounded blue and rounded purple backgrounds) and two using the shared ButtonStyleTest fixture (blue glossy pill). Tapping any button shows an alert."
};

const BlueButtonStyle = defineButtonStyle({
    body: ({ label }) => (
        label
            .padding(20)
            .background(Color("blue"))
            .foregroundStyle(Color("white"))
            .cornerRadius(12)
    )
});

const PurpleButtonStyle = defineButtonStyle({
    body: ({ label }) => (
        label
            .padding(20)
            .background(Color("purple"))
            .foregroundStyle(Color("white"))
            .cornerRadius(12)
    )
});

const body = () => {
    return (
        VStack([
            Button("My Button 34", () => {
                alert("Tapped Button");
            })
                .buttonStyle(BlueButtonStyle()),
            Button("My Button 34", () => {
                alert("Tapped Button");
            })
                .buttonStyle(PurpleButtonStyle()),
            Button("My Button 3434", () => {
                alert("Tapped Button");
            })
                .buttonStyle(ButtonStyleTest()),
            Button("My Button 3434", () => {
                alert("Tapped Button");
            })
                .buttonStyle(ButtonStyleTest())
        ])
    );
};

export default defineComponent({ metadata, body });
