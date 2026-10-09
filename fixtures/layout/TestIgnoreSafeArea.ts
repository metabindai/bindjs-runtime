const metadata = {
    title: "TestIgnoreSafeArea",
    description: "ignoresSafeArea on a background and on its view: a blue rectangle inset by 20pt padding over a green background, with the green (and the stack) extending under the device safe areas / to the preview edges."
};

const body = () => (
    Group(
        VStack([
            Rectangle()
                .fill(Color("blue"))
                .padding(20)
        ])
            .background(Color("green").ignoresSafeArea())
            .ignoresSafeArea()
    )
);

export default defineComponent({ metadata, body });
