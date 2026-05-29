import React from 'react';
import { useLayout } from '../Layout/useLayout';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { ActionsProvider } from '../Actions';

interface NavigationLinkProps {
    rawValue?: any;
    destinationHandlerId?: string;
    label?: React.ReactNode;
    environmentId?: string;
}

/**
 * NavigationLink component - displays the label content.
 * 
 * For now, this is a basic implementation that just renders the label.
 * The destination functionality would need to be implemented with a
 * navigation context/stack in the future.
 */
export function NavigationLink(props: NavigationLinkProps): React.ReactElement {
    const { rawValue, destinationHandlerId, label, environmentId } = props;

    // Perform layout calculation
    const layout = useLayout(props, NavigationLink);

    // Get label element, validate is a react component
    const linkLabelElement: React.ReactNode = React.isValidElement(label) ? label : null;

    // For now, just render the label content
    // In a full implementation, this would handle navigation on click
    const handleClick = () => {
        // TODO: Implement navigation using destinationHandlerId
        // This would integrate with a NavigationStack context
        console.log('NavigationLink clicked, destinationHandlerId:', destinationHandlerId);
    };

    return (
        <LayoutNode layout={layout}>
            <ActionsProvider actions={{ onClick: handleClick }}>
                {linkLabelElement}
            </ActionsProvider>
        </LayoutNode>
    );
}

const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: proposal
    };
};

layoutRegistry.register(
    NavigationLink,
    sizeThatFits
);

