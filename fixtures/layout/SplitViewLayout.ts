const metadata = {
    title: "SplitViewLayout",
    description: "A two-pane split container taking its first two children: the panes sit side by side (or stacked when vertical) separated by a draggable divider line in the chosen colour and width; dragging the divider re-weights the panes' layoutPriority and dims it to 80% while dragging.",
    category: "Layout"
};

const properties = {
    orientation: PropertyEnum({
        title: "Orientation",
        description: "The orientation of the split view",
        options: ["horizontal", "vertical"],
        defaultValue: "horizontal"
    }),
    initialSplitRatio: PropertyNumber({
        title: "Initial Split Ratio",
        description: "The initial ratio of the first pane (0.0 to 1.0)",
        defaultValue: 0.5,
        validation: { min: 0.1, max: 0.9 },
        inspector: { control: "slider", step: 0.1 }
    }),
    minPaneSize: PropertyNumber({
        title: "Minimum Pane Size",
        description: "Minimum size for each pane in pixels",
        defaultValue: 100,
        validation: { min: 50, max: 500 }
    }),
    showDivider: PropertyBoolean({
        title: "Show Divider",
        description: "Whether to show a divider between panes",
        defaultValue: true
    }),
    dividerColor: PropertyEnum({
        title: "Divider Color",
        description: "Color of the divider line",
        options: ["gray", "black", "white", "blue", "red", "green", "primary", "secondary"],
        defaultValue: "gray"
    }),
    dividerWidth: PropertyNumber({
        title: "Divider Width",
        description: "Width of the divider in pixels",
        defaultValue: 1,
        validation: { min: 1, max: 10 }
    })
} satisfies ComponentProperties;

// The drag maths assumes a fixed container extent rather than measuring it.
const ASSUMED_CONTAINER_SIZE = 400;

const body = (props: InferProps<typeof properties>, children: Component[]) => {
    const [splitRatio, setSplitRatio] = useState(props.initialSplitRatio);
    const [isDragging, setIsDragging] = useState(false);

    const isHorizontal = props.orientation === "horizontal";
    const firstPane = children[0] || Empty();
    const secondPane = children[1] || Empty();

    const handleDrag = (state: DragGestureState) => {
        if (state.phase === "began") {
            setIsDragging(true);
        } else if (state.phase === "changed") {
            const position = isHorizontal ? state.locationInView.x : state.locationInView.y;
            const minRatio = props.minPaneSize / ASSUMED_CONTAINER_SIZE;
            const maxRatio = 1 - minRatio;
            setSplitRatio(Math.max(minRatio, Math.min(maxRatio, position / ASSUMED_CONTAINER_SIZE)));
        } else if (state.phase === "ended" || state.phase === "cancelled") {
            setIsDragging(false);
        }
    };

    const divider = props.showDivider
        ? Rectangle()
            .fill(Color(props.dividerColor as ColorProps))
            .frame(isHorizontal ? { width: props.dividerWidth } : { height: props.dividerWidth })
            .onDragGesture(handleDrag)
            .opacity(isDragging ? 0.8 : 1.0)
        : Empty();

    const panes = [
        firstPane.layoutPriority(splitRatio),
        divider,
        secondPane.layoutPriority(1 - splitRatio)
    ];

    return isHorizontal
        ? HStack({ spacing: 0 }, panes)
        : VStack({ spacing: 0 }, panes);
};

const previews = [
    Self({}, [
        Color("blue").opacity(0.2),
        Color("green").opacity(0.2)
    ]).previewName("Horizontal"),
    Self({ orientation: "vertical", dividerColor: "red", dividerWidth: 4 }, [
        Color("blue").opacity(0.2),
        Color("green").opacity(0.2)
    ]).previewName("Vertical, thick red divider")
];

export default defineComponent({ metadata, properties, body, previews });
