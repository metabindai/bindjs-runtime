import React, { useEffect, useRef } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useStyle, StyleProvider } from '../Style';
import { ActionsProvider } from '../Actions';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface LongPressState {
    isPressed: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    startTime: number;
    timerId: number | null;
    phase: "possible" | "began" | "changed" | "ended" | "cancelled" | "failed";
}

interface OnLongPressGestureProps {
    handlerId: string;
    children: React.ReactNode[];
    minimumDuration?: number;
    maximumDistance?: number;
}

export function OnLongPressGesture(props: OnLongPressGestureProps): React.ReactNode {
    const { handlerId, children, minimumDuration = 0.5, maximumDistance = 10 } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, OnLongPressGesture);

    const durationMs = minimumDuration * 1000;
    const functionCallback = useRendererContext().functionCallback;
    const style = { ...useStyle(), cursor: 'default', userSelect: 'none' as 'none', touchAction: 'none' };
    const actions = {} as any;

    const pressStateRef = useRef<LongPressState>({
        isPressed: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        startTime: 0,
        timerId: null,
        phase: "possible"
    });

    const gestureTargetRef = useRef<HTMLDivElement | null>(null);

    const sendPhase = (
        phase: LongPressState['phase'],
        target: Element | null = null
    ) => {
        const state = pressStateRef.current;
        state.phase = phase;
        const handler = functionCallback(handlerId);

        let localX = state.currentX;
        let localY = state.currentY;

        if (target) {
            const rect = target.getBoundingClientRect();
            localX = state.currentX - rect.left;
            localY = state.currentY - rect.top;
        }

        if (handler) {
            try {
                handler({
                    phase,
                    locationInView: { x: localX, y: localY }
                });
            } catch (e) {
                console.error(`OnLongPress: Error in handler for phase ${phase}:`, e);
            }
        }
    };

    useEffect(() => {
        const handleMove = (x: number, y: number) => {
            const state = pressStateRef.current;
            if (!state.isPressed) return;

            state.currentX = x;
            state.currentY = y;

            const distance = Math.hypot(state.currentX - state.startX, state.currentY - state.startY);

            if (distance > maximumDistance && state.timerId !== null) {
                window.clearTimeout(state.timerId);
                state.timerId = null;
                sendPhase(state.phase === "possible" ? "failed" : "cancelled", gestureTargetRef.current);

                setTimeout(() => sendPhase("possible", gestureTargetRef.current), 0);
                return;
            }

            if (state.phase === "began" || state.phase === "changed") {
                sendPhase("changed", gestureTargetRef.current);
            }
        };

        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const endGesture = () => {
            const state = pressStateRef.current;
            if (state.isPressed) {
                if (state.phase === "began" || state.phase === "changed") {
                    sendPhase("ended", gestureTargetRef.current);
                }
                state.isPressed = false;
                if (state.timerId !== null) {
                    window.clearTimeout(state.timerId);
                    state.timerId = null;
                }
                setTimeout(() => sendPhase("possible", gestureTargetRef.current), 0);
                gestureTargetRef.current = null;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', endGesture);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', endGesture, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', endGesture);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', endGesture);
        };
    }, [handlerId, functionCallback, maximumDistance]);

    actions.onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const state = pressStateRef.current;
        state.isPressed = true;
        state.startX = state.currentX = e.clientX;
        state.startY = state.currentY = e.clientY;
        state.startTime = Date.now();
        state.phase = "possible";

        if (state.timerId !== null) {
            window.clearTimeout(state.timerId);
        }

        state.timerId = window.setTimeout(() => {
            if (state.isPressed) {
                sendPhase("began", gestureTargetRef.current);
            }
            state.timerId = null;
        }, durationMs);
    };

    actions.onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;

        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        const state = pressStateRef.current;
        state.isPressed = true;
        state.startX = state.currentX = touch.clientX;
        state.startY = state.currentY = touch.clientY;
        state.startTime = Date.now();
        state.phase = "possible";

        if (state.timerId !== null) {
            window.clearTimeout(state.timerId);
        }

        state.timerId = window.setTimeout(() => {
            if (state.isPressed) {
                sendPhase("began", gestureTargetRef.current);
            }
            state.timerId = null;
        }, durationMs);
    };

    return (
        <StyleProvider style={style}>
            <ActionsProvider ref={gestureTargetRef} actions={actions} gesture="onLongPress">
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </ActionsProvider>
        </StyleProvider>
    );
}
