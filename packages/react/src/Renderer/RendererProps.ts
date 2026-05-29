import { AnimationContextType } from './ui/AnimationContext';

// Define interface renderer navigation Callback function with props  RendererNavigationCallbackProps
// Returns true if navigation is handled, false otherwise
export type RendererNavigationCallback = (props: RendererNavigationCallbackProps) => boolean;

export type RendererNavigationAnimation = 'instant' | 'push' | 'fade' | 'crossFade';

// Callback is a dicationar with { to: string | object, params: object }
interface RendererNavigationCallbackProps {
    to: string | object;
    transition?: RendererNavigationAnimation;
    animationContext?: AnimationContextType; // Current animation context
    params?: Record<string, any>;
}