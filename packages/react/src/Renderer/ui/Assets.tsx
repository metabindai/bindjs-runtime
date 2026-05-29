import React, { createContext, ReactElement, useContext } from 'react';

// Define a type for the Asset object
export interface AssetMediaType {
    id: string;
    alt: string;
    name: string;
    url: string;
    dimensions?: { width: number, height: number }; 
}


// Define the type for the assets context
interface AssetsContextType {
    getAssetNamed?: (name: string, componentName: string) => Promise<AssetMediaType | null>;
    getAssetById?: (id: string, componentName: string) => Promise<AssetMediaType | null>;
  }
  
// Default context with placeholder functions
const AssetsContext = createContext<AssetsContextType>({
    getAssetNamed: async () => null,
    getAssetById: async () => null,
});


// Provider component to pass down styles
export function AssetsProvider({ children,  getAssetNamed, getAssetById }: { children: React.ReactNode;
            getAssetNamed?: (key: string, componentName: string) => Promise<AssetMediaType | null>;
            getAssetById?: (key: string, componentName: string) => Promise<AssetMediaType | null>;
        }) {
    return <AssetsContext.Provider value={{ getAssetNamed, getAssetById }}>{children}</AssetsContext.Provider>;
}


// Custom hook to use the AssetsContext
export function useAssets() {
    let context = useContext(AssetsContext);
    return { getAssetNamed: (name: string) => {
        return (context.getAssetNamed) ? context.getAssetNamed(name, '') : null;
    }, getAssetById(asset: string) {
        return (context.getAssetById) ? context.getAssetById(asset, '') : null; 
    }}
}
