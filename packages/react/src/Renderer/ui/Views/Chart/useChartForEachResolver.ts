import { useMemo } from 'react';
import { useRendererContext } from '../../../RendererContext';
import { ForEachResolver } from './ChartCollector';

export function useChartForEachResolver(): ForEachResolver {
    const rendererContext = useRendererContext();
    const { dataCallback, restoreEnvironmentCallback, setForEachId, forEachCallback, renderVersion } = rendererContext;

    return useMemo<ForEachResolver>(() => {
        return (props) => {
            const { dataId, functionId, environmentId } = props ?? {};
            if (functionId == null) {
                return [];
            }

            const data = dataCallback?.(dataId);
            if (environmentId != null) restoreEnvironmentCallback?.(environmentId);
            if (!Array.isArray(data)) return [];

            const items: unknown[] = [];
            for (let index = 0; index < data.length; index++) {
                setForEachId?.(index);
                try {
                    let callback = forEachCallback?.(functionId, data[index], index)
                    if (!callback) {
                        continue;
                    }
                    items.push(callback);
                } catch (e) {
                    console.warn('Chart ForEach callback threw', e);
                }
            }
            setForEachId?.(null);
            return items;
        };
    }, [renderVersion]);
}
