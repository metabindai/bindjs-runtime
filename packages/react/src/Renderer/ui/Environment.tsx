import { useEffect, useState, useContext, createContext } from 'react';

interface Environment {
    colorScheme?: "dark" | "light" | undefined;
    dynamicTypeSize?: "xSmall" | "small" | "medium" | "large" | "xLarge" | "xxLarge" | "xxxLarge" | "accessibility1" | "accessibility2" | "accessibility3" | "accessibility4" | "accessibility5";
    isEnabled?: boolean;
    [key: string]: any;
}

interface EnvironmentContextType {
    values: Environment;
}

const EnvironmentContext = createContext<EnvironmentContextType>({ values: {} });

export function EnvironmentProvider({ children, values }: { children: React.ReactNode; values: Environment }) {
    const context = useContext(EnvironmentContext);
    let currentEnvironment = context.values ?? {};
    return <EnvironmentContext.Provider value={{ values: { ...currentEnvironment.values, ...values } }}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
    const context = useContext(EnvironmentContext);
    let environment = {...context.values ?? {}};
    // Apply defaults for undefined values
    if (environment.colorScheme === undefined) {
        environment.colorScheme = environment.systemColorScheme;
    }
    if (environment.dynamicTypeSize === undefined) {
        environment.dynamicTypeSize = 'large'; // Default dynamic type size
    }
    return environment
}

export function Environment( { children, values}) {
    //console.log('environment values', values);
    return (
        <EnvironmentProvider values={values}>
            {children}
        </EnvironmentProvider>
    )
}
