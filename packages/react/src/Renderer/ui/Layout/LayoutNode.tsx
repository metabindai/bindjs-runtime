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

export function useLayoutContext(): LayoutContextValue | null {
    return useContext(LayoutContext);
}