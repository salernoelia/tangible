import { DataType, HandleType } from '../types/node';
import type { Node } from '../canvas/node';

export interface NodeTypeConfig {
    name: string;
    category: string;
    color: string;
    hasInput: boolean;
    handles: Array<{
        id: string;
        type: HandleType;
        position: 'input' | 'output';
        dataType: DataType;
    }>;
    defaultData: Record<string, any>;
    updateLogic?: (node: Node) => void;
}

export const nodeTypeConfigs: Record<string, NodeTypeConfig> = {
    'Add': {
        name: 'Add',
        category: 'Math',
        color: 'bg-blue-500',
        hasInput: false,
        handles: [
            { id: 'in-a', type: HandleType.Target, position: 'input', dataType: DataType.Number },
            { id: 'in-b', type: HandleType.Target, position: 'input', dataType: DataType.Number },
            { id: 'out', type: HandleType.Source, position: 'output', dataType: DataType.Number }
        ],
        defaultData: { operation: 'add' },
        updateLogic: (node: Node) => {
            const inputs = Array.from(node.inputValues.values()).filter(v => v !== null);
            if (inputs.length >= 2) {
                node.outputValue = (inputs[0] || 0) + (inputs[1] || 0);
            } else {
                node.outputValue = 0;
            }
        }
    },
    'Multiply': {
        name: 'Multiply',
        category: 'Math',
        color: 'bg-blue-500',
        hasInput: false,
        handles: [
            { id: 'in-a', type: HandleType.Target, position: 'input', dataType: DataType.Number },
            { id: 'in-b', type: HandleType.Target, position: 'input', dataType: DataType.Number },
            { id: 'out', type: HandleType.Source, position: 'output', dataType: DataType.Number }
        ],
        defaultData: { operation: 'multiply' },
        updateLogic: (node: Node) => {
            const inputs = Array.from(node.inputValues.values()).filter(v => v !== null);
            if (inputs.length >= 2) {
                node.outputValue = (inputs[0] || 0) * (inputs[1] || 0);
            } else {
                node.outputValue = 0;
            }
        }
    },
    'Number': {
        name: 'Number',
        category: 'Generator',
        color: 'bg-green-500',
        hasInput: true,
        handles: [
            { id: 'out', type: HandleType.Source, position: 'output', dataType: DataType.Number }
        ],
        defaultData: { value: 0 },
        updateLogic: (node: Node) => {
            node.outputValue = node.data.value || 0;
        }
    },
    'String': {
        name: 'String',
        category: 'Generator',
        color: 'bg-green-500',
        hasInput: true,
        handles: [
            { id: 'out', type: HandleType.Source, position: 'output', dataType: DataType.String }
        ],
        defaultData: { value: '' },
        updateLogic: (node: Node) => {
            node.outputValue = node.data.value || '';
        }
    }
};