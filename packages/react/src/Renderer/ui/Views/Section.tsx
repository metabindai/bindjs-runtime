import { useStyle } from '../Style';

export function Section({ rawValue, header, children }) {

    const currentStyle = useStyle()
    const style = {
        ...currentStyle,
        display: 'flex',
        flexDirection: 'column' as any,    
        gap: '10px',
        paddingTop: '10px',
        width: '-webkit-fill-available', 
    };

    return (
        <div style={style} >
            {rawValue ?? header}
            {children}
        </div>
    );
}