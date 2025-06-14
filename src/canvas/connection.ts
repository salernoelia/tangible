import p5 from 'p5';
import { type NodeConnection, type DataType } from '../types/node';
import { Node } from './Node';

export class Connection {
    connection: NodeConnection;

    constructor(connection: NodeConnection) {
        this.connection = connection;
    }

    draw(p: p5, sourceNode: Node, targetNode: Node, zoom: number): void {
        const sourcePos = sourceNode.getHandlePosition(this.connection.sourceHandleId);
        const targetPos = targetNode.getHandlePosition(this.connection.targetHandleId);

        if (!sourcePos || !targetPos) return;

        const controlOffset = Math.min(100, Math.abs(targetPos.x - sourcePos.x) * 0.5);
        
        const color = this.getDataTypeColor(this.connection.dataType);
        p.stroke(color.r, color.g, color.b);
        p.strokeWeight(Math.max(2, 3 / zoom));
        p.noFill();
        
        p.bezier(
            sourcePos.x, sourcePos.y,
            sourcePos.x + controlOffset, sourcePos.y,
            targetPos.x - controlOffset, targetPos.y,
            targetPos.x, targetPos.y
        );
    }

    drawPreview(p: p5, startPos: { x: number; y: number }, endPos: { x: number; y: number }, dataType: DataType, zoom: number): void {
        const controlOffset = Math.min(100, Math.abs(endPos.x - startPos.x) * 0.5);
        
        const color = this.getDataTypeColor(dataType);
        p.stroke(color.r, color.g, color.b, 150);
        p.strokeWeight(Math.max(2, 3 / zoom));
        p.noFill();
        
        p.bezier(
            startPos.x, startPos.y,
            startPos.x + controlOffset, startPos.y,
            endPos.x - controlOffset, endPos.y,
            endPos.x, endPos.y
        );
    }

    isPointOnConnection(x: number, y: number, sourceNode: Node, targetNode: Node, threshold: number = 10): boolean {
        const sourcePos = sourceNode.getHandlePosition(this.connection.sourceHandleId);
        const targetPos = targetNode.getHandlePosition(this.connection.targetHandleId);

        if (!sourcePos || !targetPos) return false;

        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        
        const distance = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
        return distance <= threshold;
    }

    private getDataTypeColor(dataType: DataType): { r: number; g: number; b: number } {
        switch (dataType) {
            case 'number':
                return { r: 100, g: 200, b: 100 };
            case 'string':
                return { r: 200, g: 100, b: 100 };
            case 'boolean':
                return { r: 100, g: 100, b: 200 };
            case 'vector':
                return { r: 200, g: 200, b: 100 };
            case 'color':
                return { r: 200, g: 100, b: 200 };
            case 'texture':
                return { r: 255, g: 100, b: 255 };
            case 'any':
                return { r: 150, g: 150, b: 150 };
            default:
                return { r: 100, g: 100, b: 100 };
        }
    }
}