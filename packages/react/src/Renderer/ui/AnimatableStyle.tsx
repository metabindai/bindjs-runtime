import React, { createContext, useContext, ReactNode, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { animate, Transition, m, AnimatePresence, AnimationPlaybackControls, useReducedMotion } from 'framer-motion';
import { AnimationContext, AnimationContextType, useAnimationContext } from './AnimationContext';
import equal from 'fast-deep-equal';

// Re-export framer-motion utilities
export const motion: typeof m = m;
export { AnimatePresence };

/**
 * Animatable properties that can be combined from multiple parents
 */
export interface AnimatableValues {
    x?: number;
    y?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    rotate?: number;
    opacity?: number;
    blur?: number;
    width?: number;
    height?: number;
    [key: string]: number | undefined;
}

/**
 * Context that accumulates animatable values from parent modifiers
 */
interface AnimatableValuesContextType {
    values: AnimatableValues;
}

const AnimatableValuesContext = createContext<AnimatableValuesContextType>({ values: {} });

/**
 * Hook to read the current combined animatable values from context
 */
function useAnimatableValues(): AnimatableValues {
    return useContext(AnimatableValuesContext).values;
}

/**
 * AnimatableValuesProvider
 * 
 * Parents use this to contribute animatable property values.
 * Values are merged with any existing values from parent providers.
 * 
 * @example
 * // In Offset modifier:
 * <AnimatableValuesProvider values={{ x: offsetX, y: offsetY }}>
 *   {children}
 * </AnimatableValuesProvider>
 * 
 * // In RotationEffect modifier:
 * <AnimatableValuesProvider values={{ rotate: degrees }}>
 *   {children}
 * </AnimatableValuesProvider>
 */
export function AnimatableValuesProvider({
    values,
    children
}: {
    values: AnimatableValues;
    children: ReactNode;
}) {
    const parentValues = useAnimatableValues();

    // Merge parent values with new values (new values take precedence for same keys)
    // For additive properties like x, y, rotate, we ADD them together
    const mergedValues = useMemo(() => {
        const result: AnimatableValues = { ...parentValues };

        for (const [key, value] of Object.entries(values)) {
            if (value !== undefined) {
                // For transform / filter properties, add values together
                if (key === 'x' || key === 'y' || key === 'rotate' || key === 'blur') {
                    result[key] = (result[key] ?? 0) + value;
                }
                // For scale, multiply
                else if (key === 'scale' || key === 'scaleX' || key === 'scaleY') {
                    result[key] = (result[key] ?? 1) * value;
                }
                // For opacity, multiply (so multiple 0.5 opacities = 0.25)
                else if (key === 'opacity') {
                    result[key] = (result[key] ?? 1) * value;
                }
                // For width/height, just override (take the most recent value)
                else if (key === 'width' || key === 'height') {
                    result[key] = value;
                }
                // For other properties, just override
                else {
                    result[key] = value;
                }
            }
        }

        return result;
    }, [parentValues, values]);

    return (
        <AnimatableValuesContext.Provider value={{ values: mergedValues }}>
            {children}
        </AnimatableValuesContext.Provider>
    );
}

/**
 * ClearAnimatableValues
 * 
 * Resets animatable values to empty, preventing parent animation values
 * from being inherited by children.
 */
export function ClearAnimatableValues({ children }: { children: ReactNode }) {
    return (
        <AnimatableValuesContext.Provider value={{ values: {} }}>
            {children}
        </AnimatableValuesContext.Provider>
    );
}

// ============================================================================
// Framer Motion Transition Helpers
// ============================================================================

/**
 * Converts SwiftUI-style spring parameters (response, dampingFraction) to 
 * Framer Motion spring parameters (stiffness, damping).
 * 
 * SwiftUI Parameters:
 * - response: Approximate duration of one oscillation in seconds
 * - dampingFraction: 0 = no damping (very bouncy), 1 = critically damped (no bounce), >1 = overdamped
 * 
 * Framer Motion Parameters:
 * - stiffness: Spring constant (higher = faster/stiffer)
 * - damping: Friction coefficient (higher = less bounce)
 * - mass: Object mass (we use 1)
 * 
 * Mathematical relationship:
 * - stiffness = (2π / response)²
 * - damping = 4π × dampingFraction / response
 */
function swiftUISpringToFramer(response: number, dampingFraction: number): { stiffness: number; damping: number } {
    const PI = Math.PI;
    const stiffness = Math.pow((2 * PI) / response, 2);
    const damping = (4 * PI * dampingFraction) / response;

    return { stiffness, damping };
}

/**
 * Converts AnimationContextType to Framer Motion transition configuration
 */
function getFramerTransition(animation: AnimationContextType): Transition {
    if (!animation.enabled) {
        return { duration: 0 };
    }

    const delay = animation.delay ?? 0;

    switch (animation.type) {
        case 'spring': {
            const response = animation.response ?? 0.5;
            const dampingFraction = animation.dampingFraction ?? 0.825;
            const { stiffness, damping } = swiftUISpringToFramer(response, dampingFraction);

            return {
                type: 'spring',
                stiffness,
                damping,
                mass: 1,
                delay,
            };
        }

        case 'interpolatingSpring': {
            if (animation.response !== undefined) {
                const dampingFraction = animation.dampingFraction ?? 1.0;
                const { stiffness, damping } = swiftUISpringToFramer(animation.response, dampingFraction);
                return {
                    type: 'spring',
                    stiffness,
                    damping,
                    mass: 1,
                    delay,
                };
            }
            return {
                type: 'spring',
                stiffness: animation.stiffness ?? 100,
                damping: animation.dampingFraction ?? 10,
                mass: 1,
                delay,
            };
        }

        case 'bouncy': {
            const response = animation.response ?? 0.5;
            const dampingFraction = animation.dampingFraction ?? 0.5;
            const { stiffness, damping } = swiftUISpringToFramer(response, dampingFraction);

            return {
                type: 'spring',
                stiffness,
                damping,
                mass: 1,
                delay,
            };
        }

        case 'snappy': {
            const response = animation.response ?? 0.3;
            const dampingFraction = animation.dampingFraction ?? 0.85;
            const { stiffness, damping } = swiftUISpringToFramer(response, dampingFraction);

            return {
                type: 'spring',
                stiffness,
                damping,
                mass: 1,
                delay,
            };
        }

        case 'linear':
            return {
                type: 'tween',
                duration: animation.duration ?? 0.3,
                ease: 'linear',
                delay,
            };

        case 'easeIn':
            return {
                type: 'tween',
                duration: animation.duration ?? 0.3,
                ease: 'easeIn',
                delay,
            };

        case 'easeOut':
            return {
                type: 'tween',
                duration: animation.duration ?? 0.3,
                ease: 'easeOut',
                delay,
            };

        case 'easeInOut':
            return {
                type: 'tween',
                duration: animation.duration ?? 0.3,
                ease: 'easeInOut',
                delay,
            };

        default: {
            const { stiffness, damping } = swiftUISpringToFramer(0.5, 0.825);
            return {
                type: 'spring',
                stiffness,
                damping,
                mass: 1,
                delay,
            };
        }
    }
}

/**
 * Gets repeat configuration for Framer Motion from AnimationContextType
 */
function getRepeatConfig(animation: AnimationContextType): Partial<Transition> {
    if (animation.repeatForever) {
        const autoreverses = typeof animation.repeatForever === 'object' && animation.repeatForever.autoreverses;
        return {
            repeat: Infinity,
            repeatType: autoreverses ? 'reverse' : 'loop',
        };
    }

    if (animation.repeatCount && animation.repeatCount > 1) {
        return {
            repeat: animation.repeatCount - 1,
            repeatType: 'loop',
        };
    }

    return {};
}

// ============================================================================
// Animation Node Hook
// ============================================================================

/**
 * Result returned by useAnimationNode hook
 */
export interface AnimationNodeResult {
    /** Ref to attach to the DOM element */
    ref: React.RefObject<HTMLElement>;
    /** 
     * Style object to apply when animation is disabled.
     * Contains CSS transform properties for the current values.
     * When animation is enabled, this may be empty as Framer handles it.
     */
    style: React.CSSProperties;
    /** Whether animation is currently enabled */
    isAnimating: boolean;
}


/**
 * Converts animatable values to CSS transform style
 */
function valuesToCSSTransform(values: AnimatableValues): React.CSSProperties {
    const transforms: string[] = [];

    if (values.x !== undefined) {
        transforms.push(`translateX(${values.x ?? 0}px)`);
    }
    if (values.y !== undefined) {
        transforms.push(`translateY(${values.y ?? 0}px)`);
    }
    if (values.z !== undefined) {
        transforms.push(`translateZ(${values.z}px)`);
    }
    if (values.rotate !== undefined) {
        transforms.push(`rotate(${values.rotate}deg)`);
    }
    if (values.scale !== undefined) {
        transforms.push(`scale(${values.scale})`);
    } else {
        if (values.scaleX !== undefined) {
            transforms.push(`scaleX(${values.scaleX})`);
        }
        if (values.scaleY !== undefined) {
            transforms.push(`scaleY(${values.scaleY})`);
        }
    }

    const style: React.CSSProperties = {};

    if (transforms.length > 0) {
        style.transform = transforms.join(' ');
    }
    if (values.opacity !== undefined) {
        style.opacity = values.opacity;
    }
    // Only emit a filter when there's an actual blur to apply — `blur(0px)`
    // would still create a compositing layer for no visual gain.
    if (values.blur !== undefined && values.blur > 0) {
        style.filter = `blur(${values.blur}px)`;
    }
    if (values.width !== undefined) {
        style.width = values.width;
    }
    if (values.height !== undefined) {
        style.height = values.height;
    }

    return style;
}

/**
 * Converts our semantic animatable values into the shape Framer Motion's
 * imperative `animate()` accepts — specifically, translating numeric `blur`
 * into a CSS filter string.
 */
function valuesToFramerTargets(values: AnimatableValues): Record<string, unknown> {
    const { blur, ...rest } = values;
    const targets: Record<string, unknown> = { ...rest };
    if (blur !== undefined) {
        targets.filter = `blur(${blur}px)`;
    }
    return targets;
}

/**
 * Builds explicit `[from, to]` keyframes for every changing property so Framer
 * doesn't have to guess the starting state by reading the DOM. Without this,
 * the first animation on a virgin element can snap framer's motion values to
 * defaults (rotate: 0, x: 0, scale: 1) and animate from those defaults — which
 * for rotation in particular can show up as an unwanted 360°/720° spin because
 * matrix decomposition is ambiguous at wrap-around angles.
 */
function buildKeyframeTargets(
    prev: AnimatableValues,
    current: AnimatableValues,
): Record<string, unknown> {
    const prevTargets = valuesToFramerTargets(prev);
    const currentTargets = valuesToFramerTargets(current);
    const out: Record<string, unknown> = {};

    for (const key of Object.keys(currentTargets)) {
        const prevVal = prevTargets[key];
        const currentVal = currentTargets[key];
        if (prevVal !== undefined && prevVal !== currentVal) {
            // Explicit keyframe from prev → current: framer interpolates between
            // the literal values, no matrix reading involved.
            out[key] = [prevVal, currentVal];
        } else {
            out[key] = currentVal;
        }
    }

    return out;
}

/**
 * Sets dimension (width/height) with min/max constraints for smooth animation.
 * Only applies constraints when the value is actually changing.
 * Constrains the element between the smaller and larger values to prevent layout jumps.
 */
function setDimensionConstraints(
    el: HTMLElement,
    prop: 'width' | 'height',
    prev: number | undefined,
    curr: number | undefined
) {
    // Only apply constraints if the value is actually changing
    if (prev == null || curr == null || prev === curr) {
        return;
    }

    const minProp = prop === 'width' ? 'minWidth' : 'minHeight';
    const maxProp = prop === 'width' ? 'maxWidth' : 'maxHeight';

    Object.assign(el.style, {
        [prop]: `${prev}px`,
        [minProp]: '', // `${Math.min(prev, curr)}px`;
        [maxProp]: '', // `${Math.max(prev, curr)}px`;
    });
}

/**
 * useAnimationNode hook
 * 
 * Called by child view components (ZStack, VStack, Text, etc.) to:
 * 1. Get a ref to attach to their DOM element
 * 2. Get combined animatable values from all parent providers
 * 3. Automatically animate when values change (if animation is enabled)
 * 4. Get fallback CSS styles when animation is disabled
 * 
 * This hook handles all animation logic internally using Framer Motion's
 * imperative animate function. No wrapper DOM elements are needed.
 * 
 * @param externalRef - Optional external ref to use instead of creating an internal one.
 *                      Useful when combining with other hooks that provide refs (e.g., useInView).
 * 
 * @example
 * // Basic usage - hook creates the ref
 * function ZStack({ children }) {
 *   const { ref, style, isAnimating } = useAnimationNode();
 *   return <div ref={ref} style={{ ...otherStyles, ...style }}>{children}</div>;
 * }
 * 
 * @example
 * // With external ref - useful when combining with other ref-providing hooks
 * function Shader({ children }) {
 *   const { ref: inViewRef, inView } = useInView();
 *   const { style } = useAnimationNode(inViewRef);
 *   return <div ref={inViewRef} style={{ ...otherStyles, ...style }}>{children}</div>;
 * }
 */
export function useAnimationNode(externalRef?: React.RefObject<HTMLElement>): AnimationNodeResult {
    const values = useAnimatableValues();
    const animation = useAnimationContext();
    const shouldReduceMotion = useReducedMotion();

    // Use external ref if provided, otherwise create internal ref
    const internalRef = useRef<HTMLElement>(null);
    const ref = externalRef ?? internalRef;

    // Track previous values and animation context
    const previousValuesRef = useRef<AnimatableValues>(values ?? {});

    // Track if motion has been applied / used
    const hasUsedFramerRef = useRef<AnimationContextType | null>(null);

    // Track animation controls
    const animationControlsRef = useRef<AnimationPlaybackControls | null>(null);

    // Check if we have any actual values to animate
    // OPTIMIZATION: Cache in ref to avoid Object.keys on every render when values is same reference
    const hasValues = Object.keys(values).length > 0;

    // OPTIMIZATION: If no values and animation disabled and Framer never used,
    // skip all animation logic - this is the common case for most components
    let shouldSkipEffect = !(animation.enabled || hasUsedFramerRef.current);

    useEffect(() => {
        // Fast path: skip if we've determined no animation work is needed
        if (shouldSkipEffect) {
            return;
        }

        // Skip if no values or no DOM element
        if (!hasValues || !ref.current) {
            return;
        }

        // Don't apply animation if values haven't changed.
        if (equal(previousValuesRef.current, values)) {
            return
        }

        // Values changed check already done in shouldSkipEffect calculation
        // Stop any existing animation before starting a new one
        if (animationControlsRef.current) {
            animationControlsRef.current.stop();
            animationControlsRef.current = null;
        }

        if (animation.enabled && !shouldReduceMotion) {
            // Build transition
            const baseTransition = getFramerTransition(animation);
            const repeatConfig = getRepeatConfig(animation);
            const transition = { ...baseTransition, ...repeatConfig };

            // If we have previous values, ensure we start from the previous state
            const hasPrev = Object.keys(previousValuesRef.current).length > 0;
            const prev = hasPrev ? previousValuesRef.current : null;
            if (hasPrev && prev) {
                const prevStyles = valuesToCSSTransform(prev);
                const el = ref.current;

                // Set transform, opacity, and filter from previous state
                if (prevStyles.transform) el.style.transform = prevStyles.transform;
                if (prevStyles.opacity != null) el.style.opacity = prevStyles.opacity.toString();
                if (prevStyles.filter) el.style.filter = prevStyles.filter as string;

                // Set dimension constraints for smooth animation
                setDimensionConstraints(el, 'width', prev.width, values.width);
                setDimensionConstraints(el, 'height', prev.height, values.height);
            }

            // Targets passed to framer:
            //   - First animation (framer MVs not warmed up): explicit `[prev, current]`
            //     keyframes so framer interpolates literally and doesn't have to
            //     read/decompose the DOM's transform matrix — which can otherwise
            //     cause spurious 360°/720° spins due to wrap-around ambiguity.
            //   - Subsequent animations: just the target value, so framer
            //     continues smoothly from its current (possibly mid-animation)
            //     motion-value state instead of snapping back to `prev`.
            const isFirstAnimation = !hasUsedFramerRef.current;
            const targets = (isFirstAnimation && prev)
                ? buildKeyframeTargets(prev, values)
                : valuesToFramerTargets(values);
            animationControlsRef.current = animate(ref.current, targets as any, transition as any);
            hasUsedFramerRef.current = { ...animation };
        } else {
            // Animation is disabled - use Framer with duration 0 to update instantly
            // Only if Framer has been used before (otherwise no-op)
            if (hasUsedFramerRef.current) {
                animate(ref.current, valuesToFramerTargets(values) as any, { duration: 0 });
            }
        }

        previousValuesRef.current = values;
    }, [shouldSkipEffect, values, shouldReduceMotion]);

    // OPTIMIZATION: Return stable empty object reference
    // When animation is disabled AND Framer has never been used, use CSS styles directly
    const style = useMemo((): React.CSSProperties => {
        // Fast paths return stable constant
        if (!shouldSkipEffect) {
            return EMPTY_STYLE;
        }
        previousValuesRef.current = values;
        return valuesToCSSTransform(values);
    }, [shouldSkipEffect, values]);

    return {
        ref,
        style,
        isAnimating: animation.enabled && !shouldReduceMotion && hasValues,
    };
}

// Stable empty result to avoid object recreation
const EMPTY_STYLE: React.CSSProperties = {};
const EMPTY_RESULT: AnimationNodeResult = {
    ref: { current: null } as React.RefObject<HTMLElement>,
    style: EMPTY_STYLE,
    isAnimating: false,
};

/**
 * Lightweight version of useAnimationNode that doesn't use Framer Motion.
 * Use this for components that are known to never need animation.
 * 
 * Returns a simple ref and empty style - no animation capability.
 * If you need animation support, use useAnimationNode() instead.
 */
function useAnimationNodeLite(): AnimationNodeResult {
    const ref = useRef<HTMLElement>(null);
    const emptyStyle = useMemo(() => ({}), []);

    return {
        ref,
        style: emptyStyle,
        isAnimating: false,
    };
}
