import React, { createContext, useContext, ReactNode } from 'react';

// interface FunctionType {
//     : string;
//     lastName: string;
//  }

interface Dictionary<T> {
    [Key: string]: T;
}

// Define a type for the style context
export interface FunctionContextType {
    functions: Dictionary<string>;
    functionArgs: Dictionary<string[]>;
    scripts:  Dictionary<string>;
}


// Create the StyleContext with an empty default value
export const FunctionContext = createContext<FunctionContextType>({ functions: {}, functionArgs: {}, scripts: {} });

// Custom hook to use the StyleContext
export function useFunctions() {
    return useContext(FunctionContext);
}

function UIFunction({ name, args, children }) {
    const { functions, functionArgs } = useFunctions();

    functions[name] = React.Children.toArray(children).join("\n");
    if (args != null) {
        functionArgs[name] = String(args).split(",");
    }
    
    return <></>
}

function Call({ name, children }) {
    const { functions, functionArgs } = useFunctions();
    const [ value, setValue] = React.useState(null);

    React.useEffect( () => {
        if (functions && functions[name]) {
            console.warn(`UIFunction "${name}" was not executed because string-based client code execution is disabled.`);
            setValue(null);
        }
        //setValue(functions[name]);
    })
    return <>{value}</>
}

function Argument() {
    return <></>
}
