import '@google/model-viewer';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import type { LayoutMeasurement, LayoutSize, LayoutSizingFunction } from '../Layout/LayoutTypes';
import { useStyle } from '../Style';
import { useAnimationNode } from '../AnimatableStyle';

interface Model3DProps {
    url?: string;
    iOSURL?: string;
    description?: string;
    cameraControls?: boolean;
    autoRotate?: boolean;
}

export function Model3D(props: Model3DProps) {
    const layout = useLayout(props, Model3D);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style: React.CSSProperties = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply animation styles
        ...animationStyle,
    };

    return (
        // @ts-ignore
        <model-viewer
            ref={animationRef}
            src={props.url}
            ios-src={props.iOSURL}
            alt={props.description}
            ar
            ar-modes="scene-viewer quick-look webxr"
            disable-tap={true}
            disable-zoom={true}
            disable-pan={true}
            auto-rotate={props.autoRotate}
            camera-controls={props.cameraControls}
            style={style}
        />
    );

}

// Size that fits implementation for layout system
const sizeThatFits: LayoutSizingFunction = ({ proposal, props, children }) => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    Model3D,
    sizeThatFits
);