import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useStyle } from '../Style';
import { useEnvironmentStyle } from '../Style';
import { useEnvironment } from '../Environment';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { useAnimationNode } from '../AnimatableStyle';

interface ProgressViewProps {
    value?: number;
    total?: number; // Optional, defaults to 1.0
}

export function ProgressView(props: ProgressViewProps) {
    const style = { ...useStyle() };
    const environmentStyle = useEnvironmentStyle();
    const environment = useEnvironment();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Get control size from environment style, default to 'regular'
    const controlSize = environmentStyle.controlSize || 'regular';

    // Only require value to be set - total is optional and defaults to 1.0
    const isIndeterminate = props.value === undefined;

    // For determinate progress, calculate percentage
    let progress = 0;
    if (!isIndeterminate) {
        const value = props.value ?? 0;
        const total = props.total ?? 1.0; // Default to 1.0 if total is missing
        progress = Math.min(Math.max(0, value / total), 1) * 100;

        // Determine height based on controlSize
        const getProgressHeight = () => {
            if (style.height) return style.height; // Use explicit height if provided

            switch (controlSize) {
                case 'mini': return '4px';      // Increased from 2px
                case 'small': return '6px';     // Increased from 4px
                case 'large': return '10px';    // Increased from 8px
                case 'extraLarge': return '12px'; // Increased from 10px
                default: return '8px';          // Increased from 6px for 'regular' size
            }
        };

        // Standard progress bar for determinate mode
        const containerStyle = {
            ...style,
            position: 'relative' as const,
            overflow: 'hidden',
            backgroundColor: style.backgroundColor || '#e0e0e0',
            borderRadius: style.borderRadius || '3px',
            height: getProgressHeight(),
            minHeight: getProgressHeight(), // Ensure minimum height matches the height
            width: '100%', // Force 100% width for determinate progress view
            display: 'block', // Ensure it's a block element to take full width
            minWidth: '100%', // Additional guarantee of full width
        };

        const accentColor = colorNodeToCSS(environmentStyle.accentColor, environment.colorScheme);

        const progressStyle = {
            position: 'absolute' as const,
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: accentColor || 'var(--color-primary)',
            borderRadius: style.borderRadius || '100px',
            transition: 'width 0.6s',
        };

        return (
            <div ref={animationRef as React.Ref<HTMLDivElement>} style={{ ...containerStyle, ...animationStyle }}>
                <div style={progressStyle}></div>
            </div>
        );
    } else {
        // Colors for the spinner
        const progressColor = 'var(--color-text-secondary)';

        // Determine spinner size based on controlSize
        const getSpinnerSize = () => {
            if (style.width) return Number(style.width); // Use explicit width if provided

            switch (controlSize) {
                case 'mini': return 34;       // Increased from 20
                case 'small': return 34;      // Increased from 30
                case 'large': return 54;      // Increased from 50
                case 'extraLarge': return 54; // Increased from 60
                default: return 40;           // Increased from 40 for 'regular' size
            }
        };

        const spinnerSize = getSpinnerSize();

        return (
            <div
                ref={animationRef as React.Ref<HTMLDivElement>}
                style={{
                    width: spinnerSize,
                    height: spinnerSize,
                    display: 'inline-block',
                    ...style,
                    ...animationStyle,
                }}
            >
                <IndeterminateSpinner
                    width={spinnerSize}
                    height={spinnerSize}
                    viewBox="0 0 120 120"
                >
                    <g transform={`translate(60, 60) scale(${spinnerSize / 80})`}>
                        <g transform="rotate(0)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} />
                        </g>
                        <g transform="rotate(45)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.84" />
                        </g>
                        <g transform="rotate(90)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.66" />
                        </g>
                        <g transform="rotate(135)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.49" />
                        </g>
                        <g transform="rotate(180)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.32" />
                        </g>
                        <g transform="rotate(225)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.32" />
                        </g>
                        <g transform="rotate(270)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.32" />
                        </g>
                        <g transform="rotate(315)">
                            <rect x="-8" y="-60" width="16" height="40" rx="8" fill={progressColor} fillOpacity="0.32" />
                        </g>
                    </g>
                </IndeterminateSpinner>
            </div>
        );
    }
}

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const IndeterminateSpinner = styled.svg`
    animation: ${spin} 1s steps(8) infinite;
    transform-origin: center;
`;


const sizeThatFits = ({ proposal, props, environment }): LayoutMeasurement => {
    const isIndeterminate = props?.value === undefined;

    // Get controlSize from environment context or default to 'regular'
    const controlSize = environment?.controlSize || 'regular';

    // For indeterminate mode, size based on controlSize
    if (isIndeterminate) {
        let size;
        switch (controlSize) {
            case 'mini': size = 34; break;       // Increased from 20
            case 'small': size = 34; break;      // Increased from 30
            case 'large': size = 54; break;      // Increased from 50
            case 'extraLarge': size = 54; break; // Increased from 60
            default: size = 40; break;           // Increased from 40 for 'regular' size
        }

        return {
            frame: {
                width: size,
                height: size
            }
        };
    } else {
        // For determinate mode, height based on controlSize
        let height;
        switch (controlSize) {
            case 'mini': height = 4; break;      // Increased from 2
            case 'small': height = 6; break;     // Increased from 4
            case 'large': height = 10; break;    // Increased from 8
            case 'extraLarge': height = 12; break; // Increased from 10
            default: height = 8; break;          // Increased from 6 for 'regular' size
        }

        return {
            frame: {
                width: Infinity, // Use a concrete width that matches the CSS width: 100%
                height: proposal.height ?? height
            }
        };
    }
}

layoutRegistry.register(
    ProgressView,
    sizeThatFits
);
