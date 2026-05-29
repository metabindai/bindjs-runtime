import React, { useEffect, useRef, createContext, useContext } from 'react';
import { ComposerGroupContext, ComposerGroupProps } from './ComposerGroup';

export const DOMIdentifableContext = createContext({ register: (id: string, ref: any, composerGroup: ComposerGroupProps | undefined) => { } });

export function DOMIdentifable({ id, type = 'component', group, className, children, onClick, onMouseOver, onMouseLeave }) {
    const ref = useRef<HTMLDivElement>(null);
    const context = useContext(DOMIdentifableContext);

    useEffect(() => {
        if (id && ref.current) {
            context.register(id, ref.current, { group: group });
        }
    }, [id, ref]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onClick) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        onClick(event);
    };

    const commonProps = {
        ref,
        'data-id': id,
        'data-type': type,
        id,
        key: id,
        className: className ?? type,
        onMouseOver,
        onMouseLeave,
        style: { display: 'contents' as const },
    };

    if (onClick) {
        return (
            <div
                {...commonProps}
                onClick={onClick}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            {...commonProps}
            role="group"
        >
            {children}
        </div>
    )
}
