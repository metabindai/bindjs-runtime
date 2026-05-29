import React, { useContext, createContext } from 'react';

interface ComposerLayoutGroupProperties {
    title?: string;
    description?: string;
    allowedComponents?: string[];
    maxItems?: number;
    minItems?: number;
}

export interface ComposerLayoutConfigurationPropertiesContextType {
    groups?: { [key: string]: ComposerLayoutGroupProperties }
}

// Create the StyleContext with an empty default value
export const ComposerLayoutConfigurationContext = createContext<ComposerLayoutConfigurationPropertiesContextType>({});

export interface ComposerGroupProps {
    group?: string
    maxItems?: number | undefined
    componentNames?: string[]
    emptyText?: string
}

// Define a type for the style context
export interface ComposerGroupContextType {
    //children?: (group: string, componentNames: string[]) => React.ReactNode | undefined
    composerGroup?: ComposerGroupProps
    emptyContent?: (group: string, componentNames: string[], emptyText?: string) => React.ReactNode
}

// Create the StyleContext with an empty default value
export const ComposerGroupContext = createContext<ComposerGroupContextType>({});

// TODO: Validate this is still used / needed. Think mostly done via DOMIdentifable ??
export function ComposerGroup({ rawValue, group, property, empty, children }) {
    const context = useContext(ComposerGroupContext)
    const layoutConfigurationContext = useContext(ComposerLayoutConfigurationContext)


    /**
     * Filter children based on the group prop.
     */
    const currentGroup = rawValue ?? group ?? property

    // Children are filtered automatically in the runtime component.
    let filteredChildren = React.Children.toArray(children)

    const existingGroup = context.composerGroup

    /**
     * Determine the component names for the group.
     */
    const componentNames = existingGroup?.componentNames ?? []
    const layoutGroup = currentGroup ?? 'children'
    if (layoutConfigurationContext.groups && layoutConfigurationContext.groups[layoutGroup]) {
        componentNames.push(...(layoutConfigurationContext.groups[layoutGroup].allowedComponents ?? []))
    }

    /**
     * Create the group
     */
    const newGroup = {
        ...existingGroup,
        group: currentGroup,
        componentNames: componentNames
    }

    /**
     * If there are no children, and an empty prop is provided, render the empty content.
     */
    const defaultEmptyContext = context.emptyContent?.(currentGroup, componentNames, undefined)
    const emptyContent = empty ?? defaultEmptyContext

    var content: React.ReactNode | null = null
    if (filteredChildren && filteredChildren.length > 0) {
        content = <>{filteredChildren}</>
    } else if (emptyContent) {
        content = <>{emptyContent}</>
    }

    return (
        <ComposerGroupContext.Provider value={{ ...context, composerGroup: newGroup }}>
            {content}
        </ComposerGroupContext.Provider>
    )
}


/**
 * Add button 
 */
export function ComposerAdd({ property, title, componentNames }) {
    let context = useContext(ComposerGroupContext)
    let composerGroupContext = useContext(ComposerLayoutConfigurationContext)

    let currentGroup = property ?? context.composerGroup?.group

    let allowedComponentNames = componentNames ?? composerGroupContext.groups?.[currentGroup]?.allowedComponents ?? []

    return context.emptyContent?.(currentGroup, allowedComponentNames, title)
}