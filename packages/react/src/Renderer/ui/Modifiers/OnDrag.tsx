import React, { useEffect, useRef } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useStyle, StyleProvider } from '../Style';
import { useLastGestureState } from '../GestureState';
import { ActionsProvider } from '../Actions';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface VelocitySample {
    x: number;
    y: number;
    timestamp: number;
}

interface DragState {
    isDragging: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    totalDeltaX: number;
    totalDeltaY: number;
    phase: 'possible' | 'began' | 'changed' | 'ended' | 'cancelled' | 'failed';
    velocitySamples: VelocitySample[];
}

interface OnDragGestureProps {
    handlerId: string;
    children: React.ReactNode[];
    minimumDistance?: number;
}

export function OnDragGesture(props: OnDragGestureProps): React.ReactNode {
    const { handlerId, children, minimumDistance = 10 } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, OnDragGesture);
    
    const functionCallback = useRendererContext().functionCallback;
    const style = { ...useStyle(), cursor: 'grab', userSelect: 'none' as 'none', touchAction: 'none' };
    const actions = {} as any;
    const [lastGestureState, setLastGestureState] = useLastGestureState();  

    const gestureTargetRef = useRef<HTMLDivElement | null>(null);
    
    const dragStateRef = useRef<DragState>({
        isDragging: false,
        hasMoved: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        totalDeltaX: 0,
        totalDeltaY: 0,
        phase: 'possible',
        velocitySamples: []
    });

    const round2 = (n: number) => Math.round(n * 100) / 100;

    const averageVelocity = (): { x: number; y: number } => {
        const now = performance.now();
        const recent = dragStateRef.current.velocitySamples.filter(s => now - s.timestamp < 100);
        if (recent.length < 2) return { x: 0, y: 0 };
        const totalTime = recent[recent.length - 1].timestamp - recent[0].timestamp;
        const totalX = recent[recent.length - 1].x - recent[0].x;
        const totalY = recent[recent.length - 1].y - recent[0].y;
        return totalTime > 0 ? { x: totalX / (totalTime / 1000), y: totalY / (totalTime / 1000) } : { x: 0, y: 0 };
    };

    const sendPhase = (phase: DragState['phase'], overrideVelocity?: { x: number; y: number }) => {
        const state = dragStateRef.current;
        state.phase = phase;
        const velocity = overrideVelocity ?? averageVelocity();
        const handler = functionCallback(handlerId);

        let localX = state.lastX;
        let localY = state.lastY;
        if (gestureTargetRef.current) {
            // Use first child as the gesture element doesnt have a bounding rect in the dom.
            const element = (gestureTargetRef.current.firstChild as HTMLElement)  ?? (gestureTargetRef.current as HTMLElement);
            const rect = element.getBoundingClientRect();
            localX = state.lastX - rect.left;
            localY = state.lastY - rect.top;
        }

        if (handler) {
            try {
                handler({
                    phase,
                    translation: {
                        x: state.totalDeltaX,
                        y: state.totalDeltaY
                    },
                    velocity: {
                        x: round2(velocity.x),
                        y: round2(velocity.y)
                    },
                    locationInView: {
                        x: localX,
                        y: localY
                    }
                });
            } catch (e) {
                console.error('OnDrag: Error in handler:', e);
            }
        }
    };

    const update = (x: number, y: number) => {
        const state = dragStateRef.current;
        const deltaX = x - state.lastX;
        const deltaY = y - state.lastY;
        const totalX = x - state.startX;
        const totalY = y - state.startY;
        const distance = Math.hypot(totalX, totalY);

        state.lastX = x;
        state.lastY = y;
        state.velocitySamples.push({ x, y, timestamp: performance.now() });
        if (state.velocitySamples.length > 10) state.velocitySamples.shift();

        if (!state.hasMoved && distance > minimumDistance) {
            state.hasMoved = true;
            state.startX = x;
            state.startY = y;
            state.totalDeltaX = 0;
            state.totalDeltaY = 0;
            state.velocitySamples = [{ x, y, timestamp: performance.now() }];
            sendPhase('began', { x: 0, y: 0 });
        } else if (state.hasMoved) {
            state.totalDeltaX = x - state.startX;
            state.totalDeltaY = y - state.startY;
            sendPhase('changed');
        }
    };

    const end = () => {
        const state = dragStateRef.current;
        if (state.isDragging) {
            if (state.phase === 'began' || state.phase === 'changed') {
                sendPhase('ended');
                setLastGestureState({ type: 'OnDrag', time: Date.now() });   
            } else if (!state.hasMoved) {
                sendPhase('failed');
            }
            state.isDragging = false;
            setTimeout(() => {
                const state = dragStateRef.current;
                state.isDragging = false;
                state.hasMoved = false;
                state.startX = 0;
                state.startY = 0;
                state.lastX = 0;
                state.lastY = 0;
                state.totalDeltaX = 0;
                state.totalDeltaY = 0;
                state.velocitySamples = [];
                sendPhase('possible');
            }, 0);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragStateRef.current.isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            update(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1 && dragStateRef.current.isDragging) {
                const t = e.touches[0];
                update(t.clientX, t.clientY);
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            end();
        };

        const handleTouchEnd = () => end();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handlerId, functionCallback, minimumDistance]);

    actions.onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const state = dragStateRef.current;
        state.isDragging = true;
        state.hasMoved = false;
        state.startX = state.lastX = e.clientX;
        state.startY = state.lastY = e.clientY;
        state.totalDeltaX = state.totalDeltaY = 0;
        state.velocitySamples = [{ x: e.clientX, y: e.clientY, timestamp: performance.now() }];
        state.phase = 'possible';
        sendPhase('possible');
        return false;
    };

    actions.onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        e.stopPropagation();
        const t = e.touches[0];
        const state = dragStateRef.current;
        state.isDragging = true;
        state.hasMoved = false;
        state.startX = state.lastX = t.clientX;
        state.startY = state.lastY = t.clientY;
        state.totalDeltaX = state.totalDeltaY = 0;
        state.velocitySamples = [{ x: t.clientX, y: t.clientY, timestamp: performance.now() }];
        state.phase = 'possible';
        sendPhase('possible');
    };

    return (
        <StyleProvider style={style}>
            <ActionsProvider ref={gestureTargetRef} actions={actions} gesture="onDrag">
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </ActionsProvider>
        </StyleProvider>
    );
}
