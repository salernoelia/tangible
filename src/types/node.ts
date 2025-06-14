export type DataType = 
    | 'number'
    | 'string'
    | 'boolean'
    | 'vector'
    | 'color'
    | 'texture'
    | 'any';

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

export type HandleType = 
    | 'source'
    | 'target';