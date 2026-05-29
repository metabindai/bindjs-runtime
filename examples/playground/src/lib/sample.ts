// The initial component shown in the editor. Written in the idiomatic BindJS
// style — globals like `defineComponent`, `VStack`, `Text`, `Button`, `Color`,
// `useState` and the `Property*` helpers are provided by the runtime and typed
// via the bundled `.d.ts` files loaded into Monaco.
export const SAMPLE_COMPONENT = `export default defineComponent({
    metadata: {
        title: "Counter Card",
        description: "A small card demonstrating BindJS layout, modifiers and state.",
    },

    properties: {
        name: { type: "string", defaultValue: "World" },
    },

    body: (props) => {
        const [count, setCount] = useState<number>(0)

        return VStack({ spacing: 12, alignment: "leading" }, [
            Text(\`Hello, \${props.name}!\`)
                .font("largeTitle"),

            Text(\`You've tapped \${count} time\${count === 1 ? "" : "s"}.\`)
                .font("body")
                .foregroundStyle(Color("secondary")),

            HStack({ spacing: 8 }, [
                Button("Tap me", () => setCount(count + 1)),
                Button("Reset", () => setCount(0)),
            ]),
        ])
            .padding(24)
            .frame({ maxWidth: Infinity, alignment: "leading" })
    },

    // Previews appear in the variant selector in the header.
    previews: [
        Self({ name: "World" }).previewName("Default"),
        Self({ name: "BindJS" }).previewName("Custom Name"),
    ],
})
`
