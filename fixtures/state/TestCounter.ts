const metadata = {
    title: "TestCounter",
    description: "useState counter: a bold \"Counter\" title, a large bold number starting at the Initial Value property (0 by default), and \"−\" / \"+\" buttons that decrement and increment it by one per tap."
};

const properties = {
    initialValue: PropertyNumber({
        title: "Initial Value",
        defaultValue: 0
    })
} satisfies ComponentProperties;

const body = (props: InferProps<typeof properties>) => {
    const [count, setCount] = useState(props.initialValue ?? 0);

    return (
        VStack({ spacing: 16 }, [
            Text("Counter")
                .font("title")
                .bold(),
            Text(String(count))
                .font("largeTitle")
                .fontWeight("bold"),
            HStack({ spacing: 12 }, [
                Button("−", () => setCount(count - 1)).font("title2"),
                Button("+", () => setCount(count + 1)).font("title2")
            ])
        ])
            .padding(24)
    );
};

const previews = [
    Self({ initialValue: 10 }).previewName("Starts at 10")
];

export default defineComponent({ metadata, properties, body, previews });
