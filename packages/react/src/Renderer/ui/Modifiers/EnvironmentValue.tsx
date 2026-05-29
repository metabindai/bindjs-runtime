import React from 'react';
import { EnvironmentProvider , useEnvironment } from '../Environment';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface EnvironmentValueProps {   
    value: string | number | boolean;
    environmentKey: string;
    children: React.ReactNode;
}

export function EnvironmentValue(props: EnvironmentValueProps): React.ReactNode {
    const { value, environmentKey, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, EnvironmentValue, { hasDOMElement: false });
    
    const environment = useEnvironment();

    return (
        <EnvironmentProvider values={{ ...environment, [environmentKey]: value }}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentProvider>
    );
}