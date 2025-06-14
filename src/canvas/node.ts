import p5 from 'p5';
import { type NodeData, type NodeHandle, type NodePosition, DataType } from '../types/node';
import { nodeTypeConfigs, type NodeTypeConfig } from '../data/nodeTypeConfigs';

export class Node {
    id: string;
    type: string;
    position: NodePosition;
    data: Record<string, any>;
    handles: NodeHandle[];
    selected: boolean = false;
    
    width: number = 200;
    height: number = 100;
    cornerRadius: number = 8;
    
    handleRadius: number = 8;
    handleSpacing: number = 25;
    
    inputValues: Map<string, any> = new Map();
    outputValue: any = null;
    hasInput: boolean = false;
    isEditing: boolean = false;
    private config: NodeTypeConfig;

    constructor(nodeData: NodeData) {
        this.id = nodeData.id;
        this.type = nodeData.type;
        this.position = nodeData.position;
        this.data = nodeData.data;
        this.handles = nodeData.handles;
        this.hasInput = nodeData.hasInput || false;
        this.config = nodeTypeConfigs[this.type];
        
        const maxHandles = Math.max(
            this.getInputHandles().length,
            this.getOutputHandles().length
        );
        this.height = Math.max(100, 60 + maxHandles * this.handleSpacing + (this.hasInput ? 30 : 0));
        
        this.getInputHandles().forEach(handle => {
            this.inputValues.set(handle.id, null);
        });
        
        this.updateOutput();
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
        
        if (sourceHandle.dataType === DataType.Any || targetHandle.dataType === DataType.Any) {
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
        const textScale = Math.max(0.8, Math.min(1.2, zoom));
        
        p.fill(this.selected ? 70 : 50);
        p.stroke(this.selected ? 120 : 80);
        p.strokeWeight(1);
        p.rect(this.position.x, this.position.y, this.width, this.height, this.cornerRadius);

        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14 * textScale);
        p.textStyle(p.BOLD);
        p.text(this.type, this.position.x + this.width / 2, this.position.y + 8);

        this.drawHandles(p, zoom, textScale);
        
        if (this.hasInput) {
            this.drawInputField(p, textScale);
        }
        
        this.drawOutputValue(p, textScale);
    }

    private drawHandles(p: p5, zoom: number, textScale: number): void {
        this.handles.forEach(handle => {
            const pos = this.getHandlePosition(handle.id);
            if (pos) {
                this.drawHandle(p, pos.x, pos.y, handle, zoom);
                this.drawHandleLabel(p, pos, handle, textScale);
            }
        });
    }

    private drawHandle(p: p5, x: number, y: number, handle: NodeHandle, zoom: number): void {
        const color = this.getDataTypeColor(handle.dataType);
        
        p.fill(handle.connected ? color.r : 40, handle.connected ? color.g : 40, handle.connected ? color.b : 40);
        p.stroke(color.r, color.g, color.b);
        p.strokeWeight(2);
        p.ellipse(x, y, this.handleRadius * 2, this.handleRadius * 2);
        
        if (handle.connected) {
            p.fill(255);
            p.noStroke();
            p.ellipse(x, y, this.handleRadius, this.handleRadius);
        }
    }

    private drawHandleLabel(p: p5, pos: { x: number; y: number }, handle: NodeHandle, textScale: number): void {
        p.fill(200);
        p.noStroke();
        p.textStyle(p.NORMAL);
        p.textSize(10 * textScale);
        
        if (handle.position === 'input') {
            p.textAlign(p.LEFT, p.CENTER);
            const displayText = this.inputValues.get(handle.id) !== null 
                ? String(this.inputValues.get(handle.id)) 
                : this.getHandleName(handle);
            p.text(displayText, pos.x + this.handleRadius + 5, pos.y);
        } else {
            p.textAlign(p.RIGHT, p.CENTER);
            p.text(this.getHandleName(handle), pos.x - this.handleRadius - 5, pos.y);
        }
    }

    private drawInputField(p: p5, textScale: number): void {
        const fieldX = this.position.x + 10;
        const fieldY = this.position.y + this.height - 35;
        const fieldWidth = this.width - 20;
        const fieldHeight = 25;
        
        p.fill(this.isEditing ? 80 : 60);
        p.stroke(this.isEditing ? 120 : 100);
        p.strokeWeight(1);
        p.rect(fieldX, fieldY, fieldWidth, fieldHeight, 3);
        
        p.fill(255);
        p.noStroke();
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(11 * textScale);
        p.textStyle(p.NORMAL);
        
        const displayValue = this.data.value !== undefined ? String(this.data.value) : '';
        p.text(displayValue, fieldX + 5, fieldY + fieldHeight / 2);
        
        if (this.isEditing) {
            p.stroke(255);
            p.strokeWeight(1);
            const textWidth = p.textWidth(displayValue);
            p.line(fieldX + 5 + textWidth + 2, fieldY + 5, fieldX + 5 + textWidth + 2, fieldY + fieldHeight - 5);
        }
    }

    private drawOutputValue(p: p5, textScale: number): void {
        if (this.outputValue !== null && this.outputValue !== undefined) {
            p.fill(150, 255, 150);
            p.noStroke(); 
            p.textAlign(p.RIGHT);
            p.textSize(10 * textScale);
            p.textStyle(p.NORMAL);
            p.text(`${this.outputValue}`, this.position.x + this.width - 5, this.position.y + 15);
        }
    }

    private getHandleName(handle: NodeHandle): string {
        const parts = handle.id.split('-');
        if (parts.length >= 2) {
            return parts[parts.length - 1];
        }
        return handle.position === 'input' ? 'in' : 'out';
    }

    private getDataTypeColor(dataType: DataType): { r: number; g: number; b: number } {
        switch (dataType) {
            case DataType.Number:
                return { r: 100, g: 200, b: 100 };
            case DataType.String:
                return { r: 200, g: 100, b: 100 };
            case DataType.Boolean:
                return { r: 100, g: 100, b: 200 };
            case DataType.Vector:
                return { r: 200, g: 200, b: 100 };
            case DataType.Color:
                return { r: 200, g: 100, b: 200 };
            case DataType.Any:
                return { r: 150, g: 150, b: 150 };
            default:
                return { r: 100, g: 100, b: 100 };
        }
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
            const currentValue = String(this.data.value || '');
            this.data.value = currentValue.slice(0, -1);
        } else if (key === 'Enter') {
            this.isEditing = false;
            if (this.type === 'Number') {
                this.data.value = parseFloat(this.data.value) || 0;
            }
            this.updateOutput();
        } else if (key.length === 1) {
            const currentValue = String(this.data.value || '');
            this.data.value = currentValue + key;
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