const metadata = {
    title: "TestFontWeight",
    description: "Nine stacked lines, each labelled with and rendered in its own font weight, from ultraLight (thinnest) through black (heaviest), getting progressively heavier top to bottom."
};

const WEIGHTS: FontWeight[] = [
    "ultraLight", "thin", "light", "regular", "medium", "semibold", "bold", "heavy", "black"
];

const body = () => VStack(WEIGHTS.map((weight) => Text(weight).fontWeight(weight)));

export default defineComponent({ metadata, body });
