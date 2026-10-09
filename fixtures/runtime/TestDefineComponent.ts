const metadata = {
    title: "TestDefineComponent",
    description: "Full defineComponent config: properties, a file-local inline defineComponent, a thumbnail component and two previews. Expect \"Hello abasbasdf 1234 <title>\" (or \"*no title*\") above a green-backed \"My Other Thing Hello 1234\"; the thumbnail is a scaled-up person glyph."
};

// TestTwo calls this as TestDefineComponent({ title, type, someNumber }).
const properties = {
    type: PropertyString({ title: "Type" }),
    title: PropertyString({ title: "Title!" }),
    someNumber: PropertyNumber({ title: "Number Property" })
} satisfies ComponentProperties;

const PERSON_SVG = `
    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.00195 10.5352C0.689453 10.5352 0.443359 10.4648 0.263672 10.3242C0.0878906 10.1875 0 9.99805 0 9.75586C0 9.37695 0.113281 8.98047 0.339844 8.56641C0.566406 8.14844 0.894531 7.75781 1.32422 7.39453C1.75391 7.02734 2.27148 6.73047 2.87695 6.50391C3.48633 6.27344 4.16992 6.1582 4.92773 6.1582C5.68945 6.1582 6.37305 6.27344 6.97852 6.50391C7.58789 6.73047 8.10547 7.02734 8.53125 7.39453C8.96094 7.75781 9.28906 8.14844 9.51562 8.56641C9.74609 8.98047 9.86133 9.37695 9.86133 9.75586C9.86133 9.99805 9.77148 10.1875 9.5918 10.3242C9.41602 10.4648 9.17188 10.5352 8.85938 10.5352H1.00195ZM4.93359 5.10938C4.51562 5.10938 4.12891 4.99609 3.77344 4.76953C3.41797 4.53906 3.13086 4.23047 2.91211 3.84375C2.69727 3.45312 2.58984 3.01562 2.58984 2.53125C2.58984 2.05469 2.69727 1.625 2.91211 1.24219C3.13086 0.859375 3.41797 0.556641 3.77344 0.333984C4.12891 0.111328 4.51562 0 4.93359 0C5.35156 0 5.73828 0.109375 6.09375 0.328125C6.44922 0.546875 6.73438 0.847656 6.94922 1.23047C7.16797 1.60938 7.27734 2.03906 7.27734 2.51953C7.27734 3.00781 7.16797 3.44727 6.94922 3.83789C6.73438 4.22852 6.44922 4.53906 6.09375 4.76953C5.73828 4.99609 5.35156 5.10938 4.93359 5.10938Z" fill="black"/>
    </svg>
`;

const body = (props: InferProps<typeof properties>) => {
    return (
        VStack([
            Text("Hello abasbasdf 1234 " + (props.title ?? "*no title*")),
            MyOtherThing({ title: "Hello 1234", title2: 1234 }).background(Color("green"))
        ])
    );
};

// Inline component defined inside the file rather than registered separately.
const MyOtherThing = defineComponent({
    properties: {
        title: PropertyString({ title: "title" }),
        title2: PropertyNumber({ title: "title2" })
    },
    body: (props) => Text("My Other Thing " + props.title)
});

const thumbnail = defineComponent({
    body: () => Image({ svg: PERSON_SVG }).scaleEffect(10)
});

const previews = [
    Self({ title: "Preview XYZ" }).previewName("First Preview"),
    Self({ title: "Preview 2" }).background(Color("blue")).previewName("Blue Background")
];

export default defineComponent({ metadata, properties, body, thumbnail, previews });
