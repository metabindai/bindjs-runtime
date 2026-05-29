import React, { useState, useEffect, createContext, useContext } from 'react';
import { useStyle } from './Style';

// Define a type for the style context
export interface ChildrenContextType {
    name?: string
    id?: string | null
    depth: number
    content: React.ReactElement[]
    attributes: React.Attributes
}

// Create the StyleContext with an empty default value
export const ChildrenContext = createContext<ChildrenContextType>({ name: "", id: null, depth: 0, content: [], attributes: {} });

function Children() {
  const style = useStyle()     
  let context = useContext(ChildrenContext)
  let content : React.ReactElement[] | null = context.content
//   if (context && (content.length > 0)) {
//         content = context.content.filter( (item) => {
//             if (React.isValidElement(item)) {
//                 return true
//             } else {
//                 return false
//             }
//         })
//   }  

  /** Reset context and return children  */
  return <ChildrenContext.Provider value={{ name: "", id: null, depth: 0, content: [], attributes: {} }}>{content}</ChildrenContext.Provider> 
}
