import { ReactNode, forwardRef, HTMLAttributes } from 'react';

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