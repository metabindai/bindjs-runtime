import React from 'react';
import { StyleProvider, useStyle } from '../Style';
import { Rectangle, RoundedRectangle, rectangleSizeThatFits } from './Rectangle';
import { px } from '../../Utils';
import { ShapeStyleProps } from '../ShapeStyle';
import { layoutRegistry } from '../Layout';

interface CapsuleProps extends ShapeStyleProps { }

function Capsule(props: CapsuleProps) : React.ReactNode {
    return <RoundedRectangle cornerRadius={9999} {...props}></RoundedRectangle>
}

layoutRegistry.register(
    RoundedRectangle,
    rectangleSizeThatFits
);

export { Capsule };