import { ReactNode, forwardRef, HTMLAttributes, createContext, useContext } from 'react';
import { ElementSemanticsProvider } from './Style';
import { ElementSemanticsType } from './StyleContext';

interface ActionsProviderProps {
    children: ReactNode;
    actions: HTMLAttributes<HTMLDivElement>;
    gesture?: string;
    showPointer?: boolean;
}

// Provider component to pass down styles
// Wrap the component with forwardRef
export const ActionsProvider = forwardRef<HTMLDivElement, ActionsProviderProps>(
    ({ children, actions, gesture, showPointer = true }, ref) => {
        return (
            <div {...actions} ref={ref} className={gesture} style={{ display: 'contents', cursor: showPointer ? 'pointer' : 'unset', ...(gesture ? { WebkitTapHighlightColor: 'transparent' } : {}) }}>
                {children}
            </div>
        );
    }
);

ActionsProvider.displayName = 'ActionsProvider';

// True inside a button or link.
const ControlContext = createContext(false);

/**
 * Renders the next DOM element as a button or link (see ElementSemanticsType), so it
 * can be focused, operated from the keyboard, and announced as a control.
 * Interactive elements can't nest, so inside another button or link the content
 * stays a plain view; clicks still reach the enclosing ActionsProvider.
 */
export function ControlProvider({ as, attributes, children }: { as: ElementSemanticsType['as'], attributes?: ElementSemanticsType['attributes'], children: ReactNode }) {
    const insideControl = useContext(ControlContext);

    if (insideControl) {
        return <>{children}</>;
    }

    return (
        <ControlContext.Provider value={true}>
            <ElementSemanticsProvider as={as} attributes={attributes}>
                {children}
            </ElementSemanticsProvider>
        </ControlContext.Provider>
    );
}
