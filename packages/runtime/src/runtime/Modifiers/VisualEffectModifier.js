export class VisualEffectBuilder {
    constructor() {
        this.result = {};
    }

    blur(radius) {
        this.result.blur = radius;
        return this;
    }

    opacity(amount) {
        this.result.opacity = amount;
        return this;
    }

    offset({ x, y }) {
        this.result.offset = { x, y };
        return this;
    }

    // supports both scale({x,y,anchor}) and scale(value)
    scale(value) {
        if (typeof value === "object" && value !== null) {
            this.result.scale = value;
        } else {
            this.result.scale = { x: value, y: value };
        }
        return this;
    }

    rotation(value) {
        if (typeof value === "object" && value !== null) {
            let degrees = value.degrees ? value.degrees : value.radians * (180 / Math.PI);
            this.result.rotation = degrees;
            return this;
        } else {
            this.result.rotation = value;
        }
        return this;
    }

    transform(matrix) {
        // Only include keys that are defined (so we don't send undefined values to Swift)
        const { m11, m12, m21, m22, tx, ty } = matrix || {};

        // Build transform object only if there's something meaningful to send
        const hasTransform =
            m11 !== undefined || m12 !== undefined ||
            m21 !== undefined || m22 !== undefined ||
            tx  !== undefined || ty  !== undefined;

        if (hasTransform) {
            this.result.transform = {
                m11: m11 ?? 1,
                m12: m12 ?? 0,
                m21: m21 ?? 0,
                m22: m22 ?? 1,
                tx:  tx  ?? 0,
                ty:  ty  ?? 0,
            };
        }

        return this;
    }

    reset() {
        this.result = {};
        return this;
    }

    build() {
        return { ...this.result };
    }

}

export function VisualEffectModifier({ args, name }) {

    // Handler function 
    var handler = (geometry) => {
        let builder = new VisualEffectBuilder();
        return args[0](builder, geometry).build();
    }

    if (handler == null) {
        return {
            props: {
                handlerId: null
            }
        }
    } else {
        return {
            props: {
                handlerId: this.storeFunction(handler, this.currentPathId(name))
            }
        }
    }
}   
