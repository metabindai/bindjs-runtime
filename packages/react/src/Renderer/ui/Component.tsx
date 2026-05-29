import React, { createContext, useContext, ReactNode } from 'react';

// Define a type for the style context
interface IDContextType {
    id: string | null;
}

// Create the StyleContext with an empty default value
const IDContext = createContext<IDContextType>({ id: null });

function useID() : string | null {
    return useContext(IDContext).id
}

// Define a type for the style context
interface ComponentContextType {
    componentAdded : (any) => void;
}

// Create the StyleContext with an empty default value
const ComponentContext = createContext<ComponentContextType>({ componentAdded: () => {} });

export function Component({ previews, parameters, name, children, body }) {
    let context = useContext(ComponentContext)
    context.componentAdded({
        previews: previews,
        parameters: parameters,
        body: body,
        children: children,
        name: name
    })
    return <ComponentContext.Provider value={{ componentAdded: () => {} }}></ComponentContext.Provider>
}