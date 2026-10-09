const metadata = {
    title: "TestUseAction",
    description: "Two tappable labels that dispatch host actions via useAction: \"Action Share\" sends `preview.share` and \"Action Hide UI\" sends `preview.toggleUI`. Nothing changes in the preview itself; the host (e.g. the Metabind preview app) should react, and each tap is logged to the console."
};

const body = () => {
    const action = useAction();

    return (
        VStack({ spacing: 20 }, [
            Text("Action Share")
                .onTapGesture(() => {
                    console.log("action preview.share");
                    action({ name: "preview.share" });
                }),
            Text("Action Hide UI")
                .onTapGesture(() => {
                    console.log("action preview.toggleUI");
                    action({ name: "preview.toggleUI" });
                })
        ])
    );
};

export default defineComponent({ metadata, body });
