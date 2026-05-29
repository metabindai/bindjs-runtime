import React from 'react';
import styled from 'styled-components';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { useRendererContext } from '../../RendererContext';

type Platform = "iOS" | "macOS" | "watchOS" | "tvOS" | "visionOS" | 'web' | 'android';

interface PlaceholderProps {
    name?: string;
    title?: string;
    props?: Record<string, any>;
    validPlatforms?: Platform[];
    overlay?: boolean;
    children?: React.ReactNode;
}

const icon = (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="10" height="10" rx="2" stroke="#A1A1A1" fill="none" strokeWidth="1.4" />
        <path d="M1 8V4c0-2 1-3 3-3h4M8 1h3c2 0 3 1 3 3v2M2 9v2c0 2 1 3 3 3h2" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
)

export function Placeholder(props: PlaceholderProps) {

    const platforms = props.validPlatforms?.length ? props.validPlatforms.join(', ') : undefined;
    const context = useRendererContext();
    const viewCallback = context.viewCallback;

    /**
     * Check if there's a view that resolves first
     */
    const view = viewCallback?.(props.name, props?.props, props.children);
    if (view) {
        return view;
    }

    if (props.children && React.Children.count(props.children) > 0) {
        return (
            <PlaceholderContainer>
                {props.children}

                <PlaceholderOverlay $overlay={props.overlay}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-start' }}>
                        {icon}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600 }}>{props.title ?? "Native Component Preview"}</span>
                            {platforms && <span style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '12px' }}>This component is interactive when viewed on {platforms}</span>}
                        </div>
                    </div>
                </PlaceholderOverlay>

            </PlaceholderContainer>
        )
    }

    return (
        <PlaceholderContainer>
            <PlaceholderContent>
                {icon}
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600 }}>{props.title ?? "Native Component"}</span>
                {platforms && <span style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '12px' }}>This component will be shown when viewing on {platforms}</span>}
            </PlaceholderContent>
        </PlaceholderContainer>
    )
}

const PlaceholderOverlay = styled.div<{ $overlay?: boolean }>`
    position: ${props => props.$overlay == false ? 'relative' : 'absolute'};
    bottom: 0px;
    left: 0px;
    right: 0px;
    margin-top: ${props => props.$overlay == false ? '12px' : '0px'};
    width: ${props => props.$overlay == false ? '100%' : 'auto'};
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    backdrop-filter: blur(12px);
    background-color: rgba(var(--color-background-control-rgb), 0.25);

`


const PlaceholderOverlayContent = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    height: 100%;
    padding: 2px;    
    position: relative;
`



const PlaceholderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 2px;    
    position: relative;
`


const PlaceholderContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 6px;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    border: 1px dashed var(--color-text-tertiary);
    background-color: var(--color-background-control);
    overflow: hidden;
    padding: 12px;
`

// Size that fits implementation for layout system
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    Placeholder,
    sizeThatFits
);
