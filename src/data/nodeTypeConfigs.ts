import type { DataType, HandleType } from '../types/node';
import type { Node } from '../canvas/Node';
import { MediaManager } from '../utils/MediaManager';
import { ShaderProcessor } from '../utils/ShaderProcessor';

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
    initLogic?: (node: Node) => Promise<void>;
}

export const nodeTypeConfigs: Record<string, NodeTypeConfig> = {
    'Add': {
        name: 'Add',
        category: 'Math',
        color: 'bg-blue-500',
        hasInput: false,
        handles: [
            { id: 'in-a', type: 'target', position: 'input', dataType: 'number' },
            { id: 'in-b', type: 'target', position: 'input', dataType: 'number' },
            { id: 'out', type: 'source', position: 'output', dataType: 'number' }
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
            { id: 'in-a', type: 'target', position: 'input', dataType: 'number' },
            { id: 'in-b', type: 'target', position: 'input', dataType: 'number' },
            { id: 'out', type: 'source', position: 'output', dataType: 'number' }
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
    'Sin': {
        name: 'Sin',
        category: 'Math',
        color: 'bg-blue-500',
        hasInput: false,
        handles: [
            { id: 'in', type: 'target', position: 'input', dataType: 'number' },
            { id: 'out', type: 'source', position: 'output', dataType: 'number' }
        ],
        defaultData: { operation: 'sin' },
        updateLogic: (node: Node) => {
            const input = node.inputValues.get(node.handles.find(h => h.position === 'input')?.id || '') || 0;
            node.outputValue = Math.sin(input);
        }
    },
    'Time': {
        name: 'Time',
        category: 'Generator',
        color: 'bg-yellow-500',
        hasInput: false,
        handles: [
            { id: 'out', type: 'source', position: 'output', dataType: 'number' }
        ],
        defaultData: { },
        updateLogic: (node: Node) => {
            node.outputValue = Date.now() / 1000;
        }
    },
    'Number': {
        name: 'Number',
        category: 'Generator',
        color: 'bg-green-500',
        hasInput: true,
        handles: [
            { id: 'out', type: 'source', position: 'output', dataType: 'number' }
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
            { id: 'out', type: 'source', position: 'output', dataType: 'string' }
        ],
        defaultData: { value: '' },
        updateLogic: (node: Node) => {
            node.outputValue = node.data.value || '';
        }
    },
    'Image': {
        name: 'Image',
        category: 'Media',
        color: 'bg-purple-500',
        hasInput: false,
        handles: [
            { id: 'out', type: 'source', position: 'output', dataType: 'texture' }
        ],
        defaultData: { mediaResource: null, isLoading: false },
        initLogic: async (node: Node) => {
            if (node.data.isLoading || node.data.mediaResource) return;
            
            node.data.isLoading = true;
            try {
                const mediaManager = MediaManager.getInstance();
                const resource = await mediaManager.loadImage(`image-${node.id}`, '/image.png');
                node.data.mediaResource = resource;
                node.data.isLoading = false;
                node.outputValue = resource;
            } catch (error) {
                console.error('Failed to load default image:', error);
                node.data.isLoading = false;
                node.data.mediaResource = null;
            }
        },
        updateLogic: (node: Node) => {
            node.outputValue = node.data.mediaResource;
        }
    },
    'Video': {
        name: 'Video',
        category: 'Media',
        color: 'bg-purple-500',
        hasInput: false,
        handles: [
            { id: 'out', type: 'source', position: 'output', dataType: 'texture' }
        ],
        defaultData: { mediaResource: null, isLoading: false, autoplay: true },
        initLogic: async (node: Node) => {
            if (node.data.isLoading || node.data.mediaResource) return;
            
            node.data.isLoading = true;
            try {
                const mediaManager = MediaManager.getInstance();
                const resource = await mediaManager.loadVideo(`video-${node.id}`, '/video.mp4', node.data.autoplay);
                node.data.mediaResource = resource;
                node.data.isLoading = false;
                node.outputValue = resource;
            } catch (error) {
                console.error('Failed to load default video:', error);
                node.data.isLoading = false;
                node.data.mediaResource = null;
            }
        },
        updateLogic: (node: Node) => {
            node.outputValue = node.data.mediaResource;
        }
    },
    'Camera': {
        name: 'Camera',
        category: 'Media',
        color: 'bg-purple-500',
        hasInput: false,
        handles: [
            { id: 'out', type: 'source', position: 'output', dataType: 'texture' }
        ],
        defaultData: { mediaResource: null, isActive: false, isLoading: false },
        initLogic: async (node: Node) => {
            if (node.data.isLoading || node.data.mediaResource) return;
            
            node.data.isLoading = true;
            
            try {
                const mediaManager = MediaManager.getInstance();
                const resource = await mediaManager.initializeCamera(`camera-${node.id}`);
                node.data.mediaResource = resource;
                node.data.isActive = true;
                node.data.isLoading = false;
                node.outputValue = resource;
            } catch (error) {
                console.error('Camera access denied:', error);
                node.data.isActive = false;
                node.data.isLoading = false;
                node.data.mediaResource = null;
                node.outputValue = null;
            }
        },
        updateLogic: (node: Node) => {
            node.outputValue = node.data.mediaResource;
        }
    },
    'Shader': {
        name: 'Shader',
        category: 'Effects',
        color: 'bg-red-500',
        hasInput: true,
        handles: [
            { id: 'texture-in', type: 'target', position: 'input', dataType: 'texture' },
            { id: 'time-in', type: 'target', position: 'input', dataType: 'number' },
            { id: 'param1-in', type: 'target', position: 'input', dataType: 'number' },
            { id: 'param2-in', type: 'target', position: 'input', dataType: 'number' },
            { id: 'param3-in', type: 'target', position: 'input', dataType: 'number' },
            { id: 'out', type: 'source', position: 'output', dataType: 'texture' }
        ],
        defaultData: { 
            fragmentShader: `precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_param1;
uniform float u_param2;
uniform float u_param3;
varying vec2 vTexCoord;

void main() {
    vec2 uv = vTexCoord;
    vec4 color = texture2D(u_texture, uv);
    
    float wave = sin(u_time * u_param1 * 2.0) * 0.5 + 0.5;
    
    color.r = mix(color.r, 1.0 - color.r, wave * u_param1);
    color.g = color.g * u_param2;
    color.b = color.b * u_param3;
    
    gl_FragColor = color;
}`,
            processedTexture: null,
            params: { param1: 1.0, param2: 1.0, param3: 1.0 }
        },
        updateLogic: (node: Node) => {
            const texture = node.inputValues.get(node.handles.find(h => h.id.includes('texture-in'))?.id || '');
            const time = node.inputValues.get(node.handles.find(h => h.id.includes('time-in'))?.id || '') || 0;
            const param1 = node.inputValues.get(node.handles.find(h => h.id.includes('param1-in'))?.id || '') || 1.0;
            const param2 = node.inputValues.get(node.handles.find(h => h.id.includes('param2-in'))?.id || '') || 1.0;
            const param3 = node.inputValues.get(node.handles.find(h => h.id.includes('param3-in'))?.id || '') || 1.0;
            
            if (texture && texture.element) {
                const shaderProcessor = ShaderProcessor.getInstance();
                const processedTexture = shaderProcessor.processTexture(
                    texture,
                    node.data.fragmentShader,
                    { time, param1, param2, param3 },
                    `shader-${node.id}`
                );
                
                node.data.processedTexture = processedTexture;
                node.outputValue = processedTexture || texture;
            } else {
                node.outputValue = null;
            }
        }
    },
    'Output': {
        name: 'Output',
        category: 'Output',
        color: 'bg-orange-500',
        hasInput: false,
        handles: [
            { id: 'texture-in', type: 'target', position: 'input', dataType: 'texture' }
        ],
        defaultData: { displayTexture: null },
        updateLogic: (node: Node) => {
            const texture = node.inputValues.get(node.handles.find(h => h.id.includes('texture-in'))?.id || '');
            node.data.displayTexture = texture;
            node.outputValue = texture;
        }
    }
};