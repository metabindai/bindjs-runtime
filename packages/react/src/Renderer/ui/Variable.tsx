import React, { createContext, useContext, ReactNode } from 'react';
import { useFunctions } from './Function';

import styled from 'styled-components'

// Define a type for the style context
interface VariablesContextType {
    variables: React.CSSProperties;
    setVariables: (any) => void;
}

// Create the StyleContext with an empty default value
const VariablesContext = createContext<VariablesContextType>({ variables: {}, setVariables: () => {} });

// Custom hook to use the StyleContext
export function useVariables() {
    return useContext(VariablesContext);
}


/**
 * Get the value of a React element variable that's passed in, or if not a variable will return original value.
 * @param variable the variable react element.
 * @returns 
 */
// 
function useVariableNode(variable) {

    /** Get variables and functions */
    const { variables } = useVariables();

    if (variable == null) { return variable; }
    if (Array.isArray(variable)) { return variable; }
    if (!React.isValidElement(variable)) { return variable; } 
    if (!(variable.props && variable.props['_type'] && variable.props['_type'] == 'Variable')) { return variable }

    let props = variable.props;
    let name = props['name'];
    
    /**
     * Resolve variable value.
     */
    if (name != null) {
        return resolveVariablePath(name, variables);// variables[name] ?? variables[name.toLowerCase()];
    }    
    return null;
}

export function Variables(props) {
    const { variables, setVariables } = useVariables();
    
    var passProps = {...props}
    delete passProps.children;
    delete passProps.key;

    let allVariables = {...variables, ...passProps};

    return <VariablesContext.Provider value={{ variables: allVariables, setVariables: setVariables }}>{props.children}</VariablesContext.Provider>;
}

function Variable(props : { name: string, defaultValue?: string, placeholder: string, children: ReactNode }) {

    // /** Get variables and functions */
    // const { variables } = useVariables();

    // /** Default Value */
    // const defaultValue = props.placeholder;

    // let name = props.name ?? props.children;
    
    // if (name != null) {
    //     let value = variables[name] ?? variables[name.toLowerCase()];
        
    //     // todo - have this resolve
    //     if (value && value.type && !React.isValidElement(value)) {
    //         return value.type
    //     }

    //     if (value != null) {
    //         return value;
    //     }
    // } 

    // return defaultValue;
}


const variableRegex = /^[\s\r\n]*\$/;
function isVariable(value) {
    return typeof value === 'string' && variableRegex.test(value);
}

const variableExtractRegex = /^[\s\r\n]*\$(.*?)[\s\r\n]*$/;

function extractVariable(value) {
    return value ? value.replace(variableExtractRegex, '$1') : null;
}

function isExpression(value) {
    return typeof value === 'string' && /^\s*\{.*\}\s*$/.test(value);
}

function isVariableOrExpression(value) {
    return isVariable(value) || isExpression(value);
}

function resolveVariablePath(key, variables) {
    let value = variables[key];

    if (value != null) {
        return value
    }

    // If a variable has a key path like environment.screen.mobile
    // Test to see if the value environment.screen == mobile
    let parts = key.split('.');
    if (parts.length > 1) {
        let valueKey = parts.slice(0, -1).join('.');
        let valueTest = parts.pop()
        //console.log(`Testing key ${valueKey} with value ${valueTest}`)
        let value = variables[valueKey];
        return (value == valueTest)
    }
}

function SetVariables({ variables, children, props  }) {
    const targetVariables = useVariables().variables;
    const functions = {...useFunctions()}

    var rewrittenVariables = {...variables};
    for (var key in variables) {
        var value = variables[key];
        rewrittenVariables[key] = resolveVariablePath(value, targetVariables);
    }

    let newChildren = React.Children.map(children, (child) => {
        if (child.type === SetVariables) {
            return <></>
        }
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { ...rewrittenVariables, ...props });
        } else {
            return child;
        }
    })
    return <>{newChildren}</>
}
