import React, { ReactNode, useContext, createContext } from "react";
import { LayoutMeasurement, LayoutContextValue } from "./LayoutTypes";

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutNode({ layout, children }: { layout: LayoutMeasurement | null; children: ReactNode }) {

    return (
        <LayoutContext.Provider value={{ parentLayoutResult: layout }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function LayoutNodeChildren({ layout, children }: { layout: LayoutMeasurement | null; children: ReactNode }) {
    return (
        <LayoutNode layout={layout}>{children}</LayoutNode>
    );
}

/**
 * A stack's children, each offered its own length when the stack shares its
 * length in points (`layout.childOffers`), otherwise all the stack's offer. A
 * ForEach gets its rows' offers as `itemOffers`, which it hands to each row.
 */
export function StackLayoutChildren({ layout, children }: { layout: LayoutMeasurement | null; children: ReactNode }) {
    const offers = layout?.childOffers;
    if (!layout || !offers) {
        return <LayoutNode layout={layout}>{children}</LayoutNode>;
    }
    let index = 0;
    return (
        <LayoutNode layout={layout}>
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
                const offer = offers[index++];
                if (!offer) return child;
                const environment = Array.isArray(offer)
                    ? { ...layout.environment, itemOffers: offer }
                    : { ...layout.environment, proposal: offer };
                return <LayoutNode layout={{ ...layout, environment }}>{child}</LayoutNode>;
            })}
        </LayoutNode>
    );
}

export function useLayoutContext(): LayoutContextValue | null {
    return useContext(LayoutContext);
}