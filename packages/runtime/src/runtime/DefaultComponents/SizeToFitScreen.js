const body = `
const body = (props, children) => {
    const env = useEnvironment()

    const padding = (props.padding ?? 0) * 2
    const contentSize = { width: props.width, height: props.height }
    const cmsSafeArea = env.safeArea ?? { top: 0, bottom: 0, left: 0, right: 0 }
    
    const aspect = contentSize.width / contentSize.height
    
    const width = contentSize.height ? Math.floor((contentSize.height * aspect) ) : contentSize.width
    const height = Math.floor(contentSize.height )

    const safeAreaVertical = cmsSafeArea.top + cmsSafeArea.bottom;

    // Screen Scale
    const hscale = Math.min(( (env.screen?.height ?? 800) - padding - safeAreaVertical) / (height ), 1.0);
    const wscale = Math.min(( (env.screen?.width ?? 400) - padding - cmsSafeArea.left - cmsSafeArea.right) / (width ), 1.0);
    const scale = Math.min(wscale,hscale);

    return (
        ZStack(children)
            .environment('screen', contentSize)
            .offset({ y: 0 })
            .isScaledToFit(scale != 1.0)
            .scaleEffect(scale) 
            .frame({ width: contentSize.width, height: contentSize.height })
    )
}
`
export default body