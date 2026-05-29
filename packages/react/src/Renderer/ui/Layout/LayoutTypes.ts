
// Context
export interface LayoutContextValue {
    parentLayoutResult: LayoutMeasurement | null;
}

// Size constants
const Unbounded = null;

type LayoutSizeValue = number | typeof Unbounded | typeof Infinity; // null means unconstrained, undefined means not specified

export type LayoutSize = {
    width: LayoutSizeValue;
    height: LayoutSizeValue;
}

export interface LayoutFrameType {
    width?: LayoutSizeValue,
    height?: LayoutSizeValue,
    minWidth?: LayoutSizeValue,
    minHeight?: LayoutSizeValue,
    maxWidth?: LayoutSizeValue,
    maxHeight?: LayoutSizeValue,
    alignment?: string
}


export interface LayoutMeasurement {
    frame: LayoutFrameType;
    subviews?: LayoutMeasurement[];
    environment?: Record<string, any>;
}

export type LayoutSizingFunction = (options: {
    proposal: LayoutSize, 
    props?: any,
    children?: React.ReactNode,
    context?: LayoutContextValue | undefined | null
    environment?: Record<string, any>
}) => LayoutMeasurement;
