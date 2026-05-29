import React from 'react';
import { EnvironmentStyleProvider, useEnvironmentStyle } from '../Style';
import { useLayout, LayoutNodeChildren, layoutRegistry, LayoutMeasurement } from '../Layout';
import { measureChildren } from '../Layout/utils';

type ControlSizeValue = 'mini' | 'small' | 'regular' | 'large' | 'extraLarge';

interface ControlSizeProps {
    rawValue: ControlSizeValue;
    children: React.ReactNode[];
}

export function ControlSize(props: ControlSizeProps): React.ReactNode {
    const { rawValue, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, ControlSize, { hasDOMElement: false });

    // Create new environment style with updated control size
    const envStyle = { 
        ...useEnvironmentStyle(),
    
        controlStyle: rawValue
    };

    return (
        <EnvironmentStyleProvider style={envStyle}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentStyleProvider>
    );
}


const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {
    const nodeEnvironment = {
        controlSize: props.rawValue
    }

    const childMeasurement = measureChildren(children, proposal, environment, nodeEnvironment)[0];

    return {
        ...childMeasurement ?? { frame: proposal},
        environment: {  
            controlSize: props.rawValue
        }
    };
}

layoutRegistry.register(
    ControlSize,
    sizeThatFits
);