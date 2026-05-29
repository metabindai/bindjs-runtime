import { useContent } from '../ContentProvider';
import { useRendererContext } from '../../RendererContext';

export interface ContentItem {
    id: string;
    name: string;
    content: any;
}

function ContentRenderer({ contentId, environmentId }: { contentId: string, environmentId?: string }) {
    const contentContext = useContent();
    const rendererContext = useRendererContext();   
    
    const environment = rendererContext.getEnvironmentCallback(environmentId) ?? {  }
    return contentContext.renderContent ? contentContext.renderContent(contentId, environment) : null;
}

export interface UIContent {
    id?: string;
    environmentId?: string;
    rawValue?: string;
}

export function UIContent({ id, environmentId, rawValue }: UIContent) {
    const contentIdToUse = id || rawValue;
    
    if (!contentIdToUse) {
        return null;
    }

    return <ContentRenderer contentId={contentIdToUse} environmentId={environmentId}/>;
}

UIContent.prototype.sizeThatFits = ({ inProposedSize, props, children }) => {
    // If a proposed size return that
    if (inProposedSize.width && inProposedSize.height) {
        return inProposedSize;
    }

    // Default size
    return { width: inProposedSize.width ?? Infinity, height: inProposedSize.height ?? Infinity };
};