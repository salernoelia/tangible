import p5 from 'p5';
import { type NodeData, type NodeHandle, type NodePosition } from '../types/node';
import { nodeTypeConfigs, type NodeTypeConfig } from '../data/NodeTypeConfigs';
import { NodeRenderer } from './NodeRenderer';

export class Node {
    id: string;
    type: string;
    position: NodePosition;
    data: Record<string, any>;
    handles: NodeHandle[];
    selected: boolean = false;
    
    width: number = 240;
    height: number = 120;
    cornerRadius: number = 8;
    
    handleRadius: number = 8;
    handleSpacing: number = 25;
    
    inputValues: Map<string, any> = new Map();
    outputValue: any = null;
    hasInput: boolean = false;
    isEditing: boolean = false;
    private config: NodeTypeConfig;
    private renderer: NodeRenderer = new NodeRenderer();

    constructor(nodeData: NodeData) {
        this.id = nodeData.id;
        this.type = nodeData.type;
        this.position = nodeData.position;
        this.data = nodeData.data;
        this.handles = nodeData.handles;
        this.hasInput = nodeData.hasInput || false;
        this.config = nodeTypeConfigs[this.type];
        
        this.calculateDimensions();
        this.initializeInputValues();
        this.initializeNode();
    }

    calculateDimensions(): void {
        const maxHandles = Math.max(
            this.getInputHandles().length,
            this.getOutputHandles().length
        );
        
        // Fixed preview dimensions (16:9 aspect ratio) - smaller and consistent
        const previewWidth = 120;
        const previewHeight = 68; // 120 * 9/16 = 67.5, rounded to 68
        
        // Base node width - more compact
        this.width = Math.max(180, previewWidth + 40); // 20px padding on each side
        
        // Adjust height for media nodes with previews
        if (['Image', 'Video', 'Camera', 'Output'].includes(this.type)) {
            this.height = 30 + previewHeight + 30 + (this.hasInput ? 30 : 0); // title + preview + bottom padding + input field
            if (this.type === 'Video') {
                this.height += 20; // video controls (reduced)
            }
        } else if (this.type === 'Shader') {
            this.height = 30 + previewHeight + 30; // title + preview + minimal padding (no input field)
        } else {
            this.height = Math.max(100, 60 + maxHandles * this.handleSpacing + (this.hasInput ? 30 : 0));
        }
    }


    private initializeInputValues(): void {
        this.getInputHandles().forEach(handle => {
            this.inputValues.set(handle.id, null);
        });
    }

    private async initializeNode(): Promise<void> {
        if (this.config?.initLogic) {
            await this.config.initLogic(this);
        }
        
        if (this.type === 'Time') {
            this.startTimeUpdate();
        }
        
        // Start real-time updates for shader nodes
        if (this.type === 'Shader') {
            this.startShaderUpdate();
        }
        
        this.updateOutput();
    }

    private startTimeUpdate(): void {
        setInterval(() => {
            if (this.type === 'Time') {
                this.updateOutput();
            }
        }, 16);
    }

    private startShaderUpdate(): void {
        setInterval(() => {
            if (this.type === 'Shader') {
                const textureInput = this.inputValues.get(this.handles.find(h => h.id.includes('texture-in'))?.id || '');
                // Only update if we have a live texture input (video or camera)
                if (textureInput && (textureInput.type === 'video' || textureInput.type === 'camera')) {
                    this.updateOutput();
                }
            }
        }, 33); // ~30fps for performance
    }

    getInputHandles(): NodeHandle[] {
        return this.handles.filter(h => h.position === 'input');
    }

    getOutputHandles(): NodeHandle[] {
        return this.handles.filter(h => h.position === 'output');
    }

    getHandlePosition(handleId: string): { x: number; y: number } | null {
        const handle = this.handles.find(h => h.id === handleId);
        if (!handle) return null;

        const inputHandles = this.getInputHandles();
        const outputHandles = this.getOutputHandles();

        if (handle.position === 'input') {
            const index = inputHandles.indexOf(handle);
            return {
                x: this.position.x - this.handleRadius,
                y: this.position.y + 40 + index * this.handleSpacing
            };
        } else {
            const index = outputHandles.indexOf(handle);
            return {
                x: this.position.x + this.width + this.handleRadius,
                y: this.position.y + 40 + index * this.handleSpacing
            };
        }
    }

    isPointInside(x: number, y: number): boolean {
        return x >= this.position.x && 
               x <= this.position.x + this.width && 
               y >= this.position.y && 
               y <= this.position.y + this.height;
    }

    getHandleAt(x: number, y: number): NodeHandle | null {
        for (const handle of this.handles) {
            const pos = this.getHandlePosition(handle.id);
            if (pos) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance <= this.handleRadius * 1.5) {
                    return handle;
                }
            }
        }
        return null;
    }

    isPointInInputField(x: number, y: number): boolean {
        if (!this.hasInput) return false;
        
        if (this.type === 'Shader') {
            const fieldX = this.position.x + 10;
            const fieldY = this.position.y + 110; // Below preview
            const fieldWidth = this.width - 20;
            const fieldHeight = this.height - 150;
            
            return x >= fieldX && x <= fieldX + fieldWidth && 
                   y >= fieldY && y <= fieldY + fieldHeight;
        }
        
        const fieldX = this.position.x + 10;
        const fieldY = this.position.y + this.height - 35;
        const fieldWidth = this.width - 20;
        const fieldHeight = 25;
        
        return x >= fieldX && x <= fieldX + fieldWidth && 
               y >= fieldY && y <= fieldY + fieldHeight;
    }

    canConnectTo(sourceHandle: NodeHandle, targetHandle: NodeHandle): boolean {
        if (sourceHandle.id === targetHandle.id) return false;
        if (sourceHandle.position === targetHandle.position) return false;
        
        if (sourceHandle.dataType === 'any' || targetHandle.dataType === 'any') {
            return true;
        }
        
        return sourceHandle.dataType === targetHandle.dataType;
    }

    updateInputValue(handleId: string, value: any): void {
        this.inputValues.set(handleId, value);
        this.updateOutput();
    }

    updateOutput(): void {
        if (this.config && this.config.updateLogic) {
            this.config.updateLogic(this);
        }
    }

    draw(p: p5, zoom: number): void {
        this.renderer.drawNode(p, this, zoom);
    }

    move(deltaX: number, deltaY: number): void {
        this.position.x += deltaX;
        this.position.y += deltaY;
    }

    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    handleInput(key: string): void {
        if (!this.hasInput || !this.isEditing) return;
        
        if (key === 'Backspace') {
            if (this.type === 'Shader') {
                this.data.fragmentShader = this.data.fragmentShader.slice(0, -1);
            } else {
                const currentValue = String(this.data.value || '');
                this.data.value = currentValue.slice(0, -1);
            }
        } else if (key === 'Enter') {
            this.isEditing = false;
            if (this.type === 'Number') {
                this.data.value = parseFloat(this.data.value) || 0;
            }
            this.updateOutput();
        } else if (key.length === 1) {
            if (this.type === 'Shader') {
                this.data.fragmentShader = (this.data.fragmentShader || '') + key;
            } else {
                const currentValue = String(this.data.value || '');
                this.data.value = currentValue + key;
            }
        }
    }
}

export function createNodeFromType(type: string, id: string, x: number, y: number): Node | null {
    const config = nodeTypeConfigs[type];
    if (!config) return null;

    const handles = config.handles.map(h => ({
        id: `${id}-${h.id}`,
        type: h.type,
        position: h.position,
        dataType: h.dataType,
        connected: false,
        connectionIds: []
    }));

    return new Node({
        id,
        type: config.name,
        position: { x, y },
        data: { ...config.defaultData },
        hasInput: config.hasInput,
        handles
    });
}

export function getAvailableNodeTypes(): Array<{ name: string; category: string; color: string }> {
    return Object.values(nodeTypeConfigs).map(config => ({
        name: config.name,
        category: config.category,
        color: config.color
    }));
}