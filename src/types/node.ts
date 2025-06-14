export interface NodeHandle {
    id: string;
    type: HandleType;
    position: 'input' | 'output';
    dataType: DataType;
    connected: boolean;
    connectionIds: string[];
}

export interface NodeConnection {
    id: string;
    sourceNodeId: string;
    sourceHandleId: string;
    targetNodeId: string;
    targetHandleId: string;
    dataType: DataType;
}

export interface NodePosition {
    x: number;
    y: number;
}

export interface NodeData {
    id: string;
    type: string;
    position: NodePosition;
    data: Record<string, any>;
    handles: NodeHandle[];
    hasInput: boolean;
}

export enum DataType {
    Number = 'number',
    String = 'string',
    Boolean = 'boolean',
    Vector = 'vector',
    Color = 'color',
    Any = 'any'
}

export enum HandleType {
    Source = 'source',
    Target = 'target'
}