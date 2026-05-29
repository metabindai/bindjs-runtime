import { StyleProvider, useStyle } from '../Style';
import { useRendererContext } from '../../RendererContext';
import { useEnvironmentStyle } from '../Style';
import { ActionsProvider } from '../Actions';
import { AST } from '@metabindai/bindjs-runtime';
import Text from './Text';
import React from 'react';
import { env } from 'process';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { useAnimationContext } from '../AnimationContext';

interface ButtonProps {
    rawValue?: any;
    handlerId?: string;
    label?: React.ReactNode;
    environmentId?: string;
}

export function Button(props: ButtonProps): React.ReactElement {

    // Destructure props
    const { rawValue, handlerId, label, environmentId } = props;

    // Perform layout calculation
    const layout = useLayout({ rawValue, handlerId, label, environmentId }, Button);

    const environmentStyle = useEnvironmentStyle();
    const rendererContext = useRendererContext();
    const functionCallback = useRendererContext().functionCallback;
    const animationContext = useAnimationContext();

    // Get button style component name and props if available.
    const { props: buttonStyleProps, handlerId: buttonStyleHandlerId, environmentId: buttonStyleEnvironmentId } = environmentStyle.buttonStyle || {};

    // Get label element, validate is a react component
    const buttonLabelElement: React.ReactNode = React.isValidElement(label) ? label : null;

    let content: React.ReactNode

    // console.log('ENV Button Style ', environmentStyle);
    // console.log('Button Style Component Name', buttonStyleComponentName)
    // console.log('Button Style Props', buttonStyleProps);
    // console.log('Button Style Handler Id', buttonStyleHandlerId);

    // If a button style is provided, define that.
    if (buttonStyleHandlerId && functionCallback) {

        // Button style will be stored in a function callback
        let buttonStyleView = functionCallback(buttonStyleHandlerId, buttonStyleEnvironmentId);


        if (buttonStyleView && typeof buttonStyleView === 'function') {
            try {
                // Re-wrap the decoded label in a representable so it can be used by the button style
                let representable = () => { return AST.Directive('ReactRepresentable', { rawValue: buttonLabelElement }, []) }
                let labelView = rendererContext.makeView(representable)

                // Execute the button style
                let view = buttonStyleView({ label: labelView }, buttonStyleProps ?? {});
                if (view) {
                    // Decode the view back to react components.
                    content = rendererContext.decodeViewCallback(view());
                } else {
                    console.warn('Button view null', buttonStyleView)
                }
            } catch (error) {
                content = null
                console.error('Button Style Error', error)
            }
        }

    } else {
        content = buttonLabelElement
    }

    const buttonAction = () => {
        if (handlerId) {
            let func = functionCallback(handlerId)
            if (func) {
                func()
            }
        }
    }

    return (
        <LayoutNode layout={layout}>
            <ActionsProvider actions={{ onClick: buttonAction }}>
                {content}
            </ActionsProvider>
        </LayoutNode>
    )

}

const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: proposal
    };
}

layoutRegistry.register(
    Button,
    sizeThatFits
);
