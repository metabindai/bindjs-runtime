import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import { RoundedRectangle, RoundedRectangleProps, rectangleSizeThatFits } from './Rectangle';

interface EllipseProps extends RoundedRectangleProps { }

function Ellipse(props: EllipseProps): React.ReactNode {
    return <RoundedRectangle cornerRadius={'50%'} {...props}></RoundedRectangle>
}

layoutRegistry.register(
    RoundedRectangle,
    rectangleSizeThatFits
);

export { Ellipse };