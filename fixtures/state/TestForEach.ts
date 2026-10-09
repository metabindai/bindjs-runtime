const metadata = {
    title: "TestForEach",
    description: "A \"ForEach\" heading followed by ten rows built with ForEach over the letters A–J: each row shows \"Row 0\"…\"Row 9\" on the left and its letter in secondary colour on the right."
};

const LETTERS = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i));

const body = () => (
    VStack({ spacing: 12 }, [
        Text("ForEach"),
        ForEach(LETTERS, (item, index) => (
            HStack([
                Text(`Row ${index}`),
                Spacer(),
                Text(item).foregroundStyle(Color("secondary"))
            ])
                .padding("horizontal", 20)
        ))
    ])
);

export default defineComponent({ metadata, body });
