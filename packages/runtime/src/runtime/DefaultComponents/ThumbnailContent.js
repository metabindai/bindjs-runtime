const body = `
const body = (props, children) => {
    let env = useEnvironment()
    const bg = env.systemColorScheme == 'dark' ? Color('#1a1a1a') : Color('#fafafa')

    const platformSizes = {
        'mobile': { width: 350, height: 750 },
        'tablet': { width: 1194, height: 834 },
        'desktop': { width: 1208, height: 832 }
    }
    
    const size = platformSizes[props.defaultPlatform ?? 'mobile']
    
    return (
        SizeToFitScreen({ width: size.width, height: size.height, padding: env.screen.height * 0.1 }, [
            VStack(children)
                .background(Color('background'))
                .shadow()
                .cornerRadius(40)
        ])
        .frame({ maxWidth: Infinity, maxHeight: Infinity })
    )
}
`

export default body