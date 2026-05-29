import { useReducer, useEffect } from 'react';
// import { useStyle } from '../../Style';

export function SFSymbol({ name, size, color }) {
    const [symbolData, setSymbolData] = useReducer((_, data) => data ?? {}, {});
    //var style = { ...useStyle() };

    useEffect(() => {
        let url = `/sfsymbol/${name}.json`
        //console.log(`SFSymbol ${url}`);

        loadJson(url).then( (data) => {
            setSymbolData(data)
        }) 
    }, [name])

    var svg = <></>

    try {
        if (symbolData['symbols']) {
            let symbol = symbolData['symbols'][name]
            let font = symbol['bold']
            let geometry = font['geometry']
            let path = font['path'] 

            //let fontSize = style.fontSize ? parseFloat(String(style.fontSize)) : 17
            let symbolFontSize = symbolData['fontSize']
            let scale = size / symbolFontSize 
            var scaledGeometry = { ...geometry }    
            scaledGeometry.width *= scale
            scaledGeometry.height *= scale

            svg = (
                <svg transform={`scale(${scale})`} width={scaledGeometry.width} height={scaledGeometry.height} viewBox={`0 0 ${geometry.width} ${geometry.height}`} fill="none">
                    <path d={path} fill={color}/>
                </svg>
            )
        }
    } catch (error) {
        console.error('Error loading symbol:', error);
    }
    
    return svg
}

async function loadJson(url : string) : Promise<any | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return null
    }
}
