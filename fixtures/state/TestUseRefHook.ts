const metadata = {
    title: "TestUseRefHook",
    description: "useRef does not trigger re-renders: tapping \"TestUseRefHook N\" increments a ref but the number stays the same until you tap \"Re-render\", which bumps state and reveals the accumulated count."
};

const body = () => {
    const ref = useRef(0);
    const [render, setRender] = useState(0);

    return (
        VStack([
            Text("TestUseRefHook " + String(ref.current))
                .onTapGesture(() => {
                    ref.current += 1;
                }),
            Text("Re-render")
                .onTapGesture(() => {
                    setRender(render + 1);
                })
        ])
    );
};

export default defineComponent({ metadata, body });
