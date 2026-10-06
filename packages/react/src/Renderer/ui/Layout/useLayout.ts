import { LayoutFrameType, LayoutMeasurement } from "./LayoutTypes";
import DefaultLayoutSystemRegistry from "./LayoutRegistry";
import { useLayoutContext } from "./LayoutNode";
import { LayoutSizingFunction, LayoutContextValue } from "./LayoutTypes";
import { measureMaxChild, defaultSizingFunction } from "./utils";
import { getOffer, offeredWidth, offeredHeight } from "./offer";
import { useRendererContext } from "../../RendererContext";
import { expandForEach } from "../Views/ForEach";

function layoutElement(props, children, nodeType: React.ElementType, layoutContext?: LayoutContextValue | null, parentLayoutResult?: LayoutMeasurement | null, environment?: Record<string, any>): LayoutMeasurement {

    // Start with an unbounded frame
    let frame = { width: null, height: null }

    // Get sizing function for this node type
    const sizeFunction = DefaultLayoutSystemRegistry.get(nodeType)?.sizingFn ?? defaultSizingFunction;

    // Determine size based on current environment and children
    return sizeFunction({ proposal: frame, props, children, context: layoutContext, environment });
}


interface UseLayoutOptions {
    // Hint to layout system to indicate whether the component includes a DOM element or if is just passing through environment etc.
    // As in the currently system we dont need to call the sizing function for any component that does not render a DOM element.
    // Defaults to true
    hasDOMElement?: boolean;
}

// Layout hook used by components.
export function useLayout(props, nodeType: React.ElementType, options: UseLayoutOptions = { hasDOMElement: true }): LayoutMeasurement {

    // Get children and rest of props from props
    const { children, ...otherProps } = props;

    // Get current layout context
    const layoutContext = useLayoutContext();   

    // Get current environment from layout context. The layout pass builds a
    // lazy ForEach's items through the renderer to measure them.
    const rendererContext = useRendererContext();
    const parentEnvironment = layoutContext?.parentLayoutResult?.environment ?? {};
    const currentEnvironment = rendererContext && !parentEnvironment.expandForEach
        ? { ...parentEnvironment, expandForEach: (props: Record<string, any>) => expandForEach(props, rendererContext) }
        : parentEnvironment;

    // Use layoutElement to calculate the layout
    // If the component does not have a DOM element, we just pass through the parent's layout result.
    const layoutMeasurement = options.hasDOMElement ? 
            layoutElement(otherProps, children, nodeType, layoutContext, layoutContext?.parentLayoutResult, currentEnvironment) :
            { ...layoutContext?.parentLayoutResult ?? { frame: {} } };

    // Merge current environment with parent's environment
    const newEnvironment = {
        ...currentEnvironment,
        ...layoutMeasurement.environment,
    };

    // A node that draws an element sets the offer its children see: the one its
    // sizing function returned, or the one its own size implies. Nodes without
    // an element pass their parent's offer through.
    if (options.hasDOMElement) {
        const parentOffer = getOffer(currentEnvironment);
        const own = layoutMeasurement.frame ?? {};
        newEnvironment.proposal = layoutMeasurement.environment?.offer ?? {
            width: offeredWidth(own.width, parentOffer.width),
            height: offeredHeight(own.height, parentOffer.height),
        };
        delete newEnvironment.offer;
    }

    // Update layout measurement with new environment
    layoutMeasurement.environment = newEnvironment;

    // Return layout measurement result.
    return layoutMeasurement;
}