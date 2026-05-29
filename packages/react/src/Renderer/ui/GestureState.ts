import React, { ReactNode, useContext, createContext, ReactElement, forwardRef, HTMLAttributes } from 'react';


interface GestureState {
    type: 'OnDrag' | 'OnTap' | 'OnLongPress' | undefined;
    time: number; 
}

/**
 * State to allow actions to determine last gesture state
 */
const lastGestureStateRef = { current: { type: undefined, time: 0 } } 

const setLastGestureState = (state: GestureState) => {
    lastGestureStateRef.current = state;
}

export const useLastGestureState = () => { 
    return [lastGestureStateRef, setLastGestureState] as const;   
}
