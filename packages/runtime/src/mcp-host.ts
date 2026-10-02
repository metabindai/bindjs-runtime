export interface MCPContentBlock {
    type: 'text' | 'image' | 'audio' | 'resource_link' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    uri?: string;
    name?: string;
    resource?: Record<string, unknown>;
    annotations?: { audience?: ('user' | 'assistant')[]; priority?: number; lastModified?: string };
    _meta?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface MCPHostContext {
    displayMode?: 'inline' | 'fullscreen' | 'pip';
    availableDisplayModes?: ('inline' | 'fullscreen' | 'pip')[];
    containerDimensions?: { width?: number; height?: number; maxWidth?: number; maxHeight?: number };
    locale?: string;
    theme?: 'light' | 'dark';
    styles?: { variables?: Record<string, string | undefined>; css?: { fonts?: string } };
    'openai/deepLink'?: { url: string };
    'openai/modelContext'?: {
        updateId: string;
        content?: MCPContentBlock[];
        structuredContent?: Record<string, unknown>;
    } | null;
    [key: string]: unknown;
}

export interface MCPModelContext {
    content?: MCPContentBlock[];
    structuredContent?: Record<string, unknown>;
}

export interface MCPMessageOptions {
    target?: 'active' | 'new';
    send?: true;
}

export interface MCPHost {
    readonly hostContext: MCPHostContext;
    readonly openedWithEmptyInput: boolean;
    subscribeHostContext(listener: (context: MCPHostContext) => void): () => void;
    toolCall(name: string, args?: Record<string, unknown>): Promise<unknown>;
    sendMessage(content: string | MCPContentBlock[], options?: MCPMessageOptions): Promise<void>;
    updateModelContext(context: MCPModelContext | Record<string, unknown>): Promise<void>;
    openLink(url: string): Promise<void>;
    requestDisplayMode(mode: string): Promise<void>;
    sizeChanged(height: number): void;
    log(level: 'debug' | 'info' | 'warning' | 'error', message: string, data?: Record<string, unknown>): void;
    sendRequest(method: string, params: Record<string, unknown>): Promise<unknown>;
    sendNotification(method: string, params?: Record<string, unknown>): void;
}
