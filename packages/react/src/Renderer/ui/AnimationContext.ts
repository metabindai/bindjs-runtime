import React, { createContext } from 'react';

// Define a type for the style context
export interface AnimationContextType {
    enabled: boolean;
    duration?: number;
    delay?: number;
    type?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'bouncy' | 'damped' | 'snappy' | 'interpolatingSpring';
    dampingFraction?: number;
    response?: number;
    stiffness?: number;
    tension?: number;
    repeatForever?: boolean | { autoreverses: boolean };
    repeatCount?: number;
}

// Create the StyleContext with an empty default value
export const AnimationContext = createContext<AnimationContextType | undefined>({ enabled: false });

export const useAnimationContext = () => {
    let context = React.useContext(AnimationContext);
    return context && context.enabled ? context : { enabled: false };
}

export const cssForAnimation = (animation: AnimationContextType | undefined): string => {
    if (animation == null) {
        return 'none';
    }
    if (animation.enabled) {
        // Map curve to CSS timing function
        let timingFunction = 'ease';
        let duration = animation.duration ?? 0.5;
        let delay = animation.delay ?? 0;

        switch (animation.type) {
            case 'spring':
                duration = animation.response ?? 0.5;
                timingFunction = 'cubic-bezier(0.5, 1.1, 0.5, 1)';
                break;

            case 'interpolatingSpring':
                duration = 1 / (animation.stiffness ?? 1.0);
                timingFunction = 'cubic-bezier(0.5, 1.1, 0.5, 1)';
                break;

            case 'snappy':
                duration = animation.response ?? 0.3;
                timingFunction = 'cubic-bezier(0.4, 0, 0.6, 1)';
                break;

            case 'bouncy':
                duration = animation.duration ?? 0.5;
                timingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
                break;

            case 'easeIn':
            case 'easeOut':
            case 'easeInOut':
            case 'linear':
                duration = animation.duration ?? 0.3;
                delay = 'delay' in animation ? animation.delay ?? 0 : 0;
                const timingMap = {
                    'easeIn': 'ease-in',
                    'easeOut': 'ease-out',
                    'easeInOut': 'ease-in-out',
                    'linear': 'linear',
                }
                timingFunction = timingMap[animation.type] ?? 'ease-in-out';
                break;

            default:
                duration = 0.3;
                timingFunction = 'ease';
                break;

        }

        let css = `all ${duration}s ${timingFunction} ${delay}s`;
        console.log(css);
        return css;

    }
    return 'none';
}