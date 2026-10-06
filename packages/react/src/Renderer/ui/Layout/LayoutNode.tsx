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
 * A stack's children, each offered its own share when the stack shares its
 * length in points (`layout.childOffers`), otherwise all the stack's offer.
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
                return <LayoutNode layout={{ ...layout, environment: { ...layout.environment, proposal: offer } }}>{child}</LayoutNode>;
            })}
        </LayoutNode>
    );
}

export function useLayoutContext(): LayoutContextValue | null {
    return useContext(LayoutContext);
}