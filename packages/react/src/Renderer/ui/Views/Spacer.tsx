import { layoutRegistry, LayoutMeasurement, useLayout } from "../Layout"

export function Spacer(props) {
    const layout = useLayout(props, Spacer);

    const style = { 
        flexGrow: 1
    }

    const className = `spacer ${layout.environment?.layout ?? ''}-spacer`

    return (
        <div style={style} className={className}/>
    )
}

const sizeThatFits = ({ proposal, props, children, environment }) : LayoutMeasurement => {
    if (environment?.layout === 'hstack') {
        return {
            frame: { width: Infinity, height: proposal.height }
        }
    } else if (environment?.layout === 'vstack') {
        return {
            frame: { width: proposal.width, height: Infinity }
        }
    } else {
        return {
            frame: { width: Infinity, height: Infinity }
        }
    }
}

layoutRegistry.register(
    Spacer,
    sizeThatFits
);