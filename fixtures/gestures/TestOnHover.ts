const metadata = {
    title: "TestOnHover",
    description: "The text \"TestOnHover\" is blue; moving the pointer over it turns it green, and moving the pointer away turns it blue again."
};

const body = () => {
    const [hovered, setHovered] = useState(false);

    return (
        VStack([
            Text("TestOnHover")
                .foregroundStyle(hovered ? Color("green") : Color("blue"))
                .onHover((isHovering) => {
                    setHovered(isHovering);
                })
        ])
    );
};

export default defineComponent({ metadata, body });
