/**
 * Layout Tree Manager
 */
// Sizing function registry
import { LayoutSizingFunction } from "./LayoutTypes";

interface LayoutRegistrySizingFunctionInfo {
    sizingFn: LayoutSizingFunction;
}

// RoundedRectangle.prototype.sizeThatFits = ({ inProposedSize, props, children }) => {
//     return Rectangle.prototype.sizeThatFits({ inProposedSize, props, children })
// }

// Unwrap memo(), forwardRef(), lazy(), etc.
// This ensures the WeakMap always receives the REAL component function.
function unwrapComponentType(type: any): Function {
    if (type?.$$typeof === Symbol.for("react.memo")) {
        return unwrapComponentType(type.type);
    }
    if (type?.$$typeof === Symbol.for("react.forward_ref")) {
        return unwrapComponentType(type.render);
    }
    if (type?.$$typeof === Symbol.for("react.lazy")) {
        // lazy components wrap the inner component in a promise/initializer
        // You can choose to unwrap here or leave it unresolved.
        return type; 
    }
    return type;
}

class LayoutSystemRegistry {
    private sizingFns = new WeakMap<Function, LayoutRegistrySizingFunctionInfo>();

    /**
     * Register a sizing function for a specific React component function.
     * Works reliably in production even after minification.
     */
    register(
        component: React.ElementType,
        sizingFn: LayoutSizingFunction
    ) {
        const key = unwrapComponentType(component);
        this.sizingFns.set(key, { sizingFn });
    }

    /**
     * Retrieve the sizing metadata for a given React component type.
     */
    get(component: React.ElementType): LayoutRegistrySizingFunctionInfo | undefined {
        const key = unwrapComponentType(component);
        return this.sizingFns.get(key);
    }

    clear() {
        this.sizingFns = new WeakMap();
    }
}

// Export a singleton instance of the class
const DefaultLayoutSystemRegistry = new LayoutSystemRegistry();

// Export global singleton
export default DefaultLayoutSystemRegistry;
export const layoutRegistry = DefaultLayoutSystemRegistry;