
// flexDirection 'row'
const alignmentMap = {
    topLeading: { justifyContent: "flex-start", alignItems: "flex-start" },
    top: { justifyContent: "center", alignItems: "flex-start" },
    topTrailing: { justifyContent: "flex-start", alignItems: "flex-end" },
    leading: { justifyContent: "flex-start", alignItems: "center" },
    center: { justifyContent: "center", alignItems: "center" },
    trailing: { justifyContent: "flex-end", alignItems: "center" },
    bottomLeading: { justifyContent: "flex-start", alignItems: "flex-end" },
    bottom: { justifyContent: "center", alignItems: "flex-end" },
    bottomTrailing: { justifyContent: "flex-end", alignItems: "flex-end" }
};

const horizontalAlignmentMap = {
    leading: 'flex-start',
    center: 'center',
    trailing: 'flex-end'
};

const verticalAlignmentMap = {  
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
};

type Alignment = keyof typeof alignmentMap;
type HorizontalAlignment = keyof typeof horizontalAlignmentMap;
type VerticalAlignment = keyof typeof verticalAlignmentMap;

export type { Alignment, HorizontalAlignment, VerticalAlignment };

export { alignmentMap, horizontalAlignmentMap, verticalAlignmentMap };
