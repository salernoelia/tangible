import p5 from 'p5';
import { Node, createNodeFromType } from './node';
import { Connection } from './connection';
import { type NodeConnection, type NodeHandle } from '../types/node';
import { CanvasControls } from '../utils/controls';

interface DragState {
    isDragging: boolean;
    dragTarget: 'node' | 'connection' | null;
    draggedNode: Node | null;
    connectionStart: { node: Node; handle: NodeHandle } | null;
    lastMousePos: { x: number; y: number };
}

export class NodeEditor {
    private nodes: Map<string, Node> = new Map();
    private connections: Map<string, Connection> = new Map();
    private dragState: DragState = {
        isDragging: false,
        dragTarget: null,
        draggedNode: null,
        connectionStart: null,
        lastMousePos: { x: 0, y: 0 }
    };
    private controls: CanvasControls;
    private pendingNodeType: string | null = null;

    constructor(controls: CanvasControls) {
        this.controls = controls;
        this.initializeTestNodes();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('node-selected', (event: any) => {
            this.pendingNodeType = event.detail.nodeType;
        });
    }

    private initializeTestNodes(): void {
        const numberNode1 = createNodeFromType('Number', 'num1', 100, 100);
        if (numberNode1) {
            numberNode1.data.value = 5;
            numberNode1.updateOutput();
            this.addNode(numberNode1);
        }
        
        const numberNode2 = createNodeFromType('Number', 'num2', 100, 300);
        if (numberNode2) {
            numberNode2.data.value = 3;
            numberNode2.updateOutput();
            this.addNode(numberNode2);
        }
        
        const mathNode = createNodeFromType('Add', 'math1', 400, 200);
        if (mathNode) {
            this.addNode(mathNode);
        }
    }

    addNode(node: Node): void {
        this.nodes.set(node.id, node);
    }

    removeNode(nodeId: string): void {
        const connectionsToRemove: string[] = [];
        this.connections.forEach((connection, id) => {
            if (connection.connection.sourceNodeId === nodeId || 
                connection.connection.targetNodeId === nodeId) {
                connectionsToRemove.push(id);
            }
        });
        
        connectionsToRemove.forEach(id => this.connections.delete(id));
        this.nodes.delete(nodeId);
    }

    addConnection(sourceNodeId: string, sourceHandleId: string, targetNodeId: string, targetHandleId: string): boolean {
        const sourceNode = this.nodes.get(sourceNodeId);
        const targetNode = this.nodes.get(targetNodeId);
        
        if (!sourceNode || !targetNode) return false;

        const sourceHandle = sourceNode.handles.find(h => h.id === sourceHandleId);
        const targetHandle = targetNode.handles.find(h => h.id === targetHandleId);
        
        if (!sourceHandle || !targetHandle) return false;
        if (!sourceNode.canConnectTo(sourceHandle, targetHandle)) return false;

        if (targetHandle.position === 'input') {
            this.removeConnectionsToHandle(targetNodeId, targetHandleId);
        }

        const connectionId = `${sourceNodeId}-${sourceHandleId}-${targetNodeId}-${targetHandleId}`;
        const connection: NodeConnection = {
            id: connectionId,
            sourceNodeId,
            sourceHandleId,
            targetNodeId,
            targetHandleId,
            dataType: sourceHandle.dataType
        };

        this.connections.set(connectionId, new Connection(connection));
        
        sourceHandle.connected = true;
        sourceHandle.connectionIds.push(connectionId);
        targetHandle.connected = true;
        targetHandle.connectionIds.push(connectionId);

        this.propagateValue(sourceNodeId, targetNodeId, targetHandleId);

        return true;
    }

    private propagateValue(sourceNodeId: string, targetNodeId: string, targetHandleId: string): void {
        const sourceNode = this.nodes.get(sourceNodeId);
        const targetNode = this.nodes.get(targetNodeId);
        
        if (sourceNode && targetNode) {
            targetNode.updateInputValue(targetHandleId, sourceNode.outputValue);
            
            targetNode.getOutputHandles().forEach(outputHandle => {
                outputHandle.connectionIds.forEach(connectionId => {
                    const connection = this.connections.get(connectionId);
                    if (connection) {
                        this.propagateValue(targetNodeId, connection.connection.targetNodeId, connection.connection.targetHandleId);
                    }
                });
            });
        }
    }

    private removeConnectionsToHandle(nodeId: string, handleId: string): void {
        const connectionsToRemove: string[] = [];
        this.connections.forEach((connection, id) => {
            if ((connection.connection.targetNodeId === nodeId && connection.connection.targetHandleId === handleId) ||
                (connection.connection.sourceNodeId === nodeId && connection.connection.sourceHandleId === handleId)) {
                connectionsToRemove.push(id);
            }
        });
        
        connectionsToRemove.forEach(id => this.removeConnection(id));
    }

    removeConnection(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        const sourceNode = this.nodes.get(connection.connection.sourceNodeId);
        const targetNode = this.nodes.get(connection.connection.targetNodeId);

        if (sourceNode) {
            const handle = sourceNode.handles.find(h => h.id === connection.connection.sourceHandleId);
            if (handle) {
                handle.connectionIds = handle.connectionIds.filter(id => id !== connectionId);
                handle.connected = handle.connectionIds.length > 0;
            }
        }

        if (targetNode) {
            const handle = targetNode.handles.find(h => h.id === connection.connection.targetHandleId);
            if (handle) {
                handle.connectionIds = handle.connectionIds.filter(id => id !== connectionId);
                handle.connected = handle.connectionIds.length > 0;
                targetNode.updateInputValue(handle.id, null);
            }
        }

        this.connections.delete(connectionId);
    }

    handleMousePressed(p: p5): boolean {
        if (p.key === ' ') {
            return false;
        }
        
        const worldPos = this.controls.screenToWorld(p.mouseX, p.mouseY);
        
        if (this.pendingNodeType) {
            const newNode = createNodeFromType(this.pendingNodeType, `node-${Date.now()}`, worldPos.x, worldPos.y);
            if (newNode) {
                this.addNode(newNode);
            }
            this.pendingNodeType = null;
            document.dispatchEvent(new CustomEvent('toggle-node-picker'));
            return true;
        }
        
        for (const node of this.nodes.values()) {
            if (node.hasInput && node.isPointInInputField(worldPos.x, worldPos.y)) {
                this.nodes.forEach(n => n.isEditing = false);
                node.isEditing = true;
                return true;
            }
        }
        
        for (const node of this.nodes.values()) {
            const handle = node.getHandleAt(worldPos.x, worldPos.y);
            if (handle) {
                this.dragState.connectionStart = { node, handle };
                this.dragState.isDragging = true;
                this.dragState.dragTarget = 'connection';
                return true;
            }
        }

        for (const node of this.nodes.values()) {
            if (node.isPointInside(worldPos.x, worldPos.y)) {
                this.nodes.forEach(n => {
                    n.selected = false;
                    n.isEditing = false;
                });
                
                node.selected = true;
                this.dragState.isDragging = true;
                this.dragState.dragTarget = 'node';
                this.dragState.draggedNode = node;
                this.dragState.lastMousePos = worldPos;
                return true;
            }
        }

        this.nodes.forEach(n => {
            n.selected = false;
            n.isEditing = false;
        });
        return false;
    }

    handleMouseDragged(p: p5): boolean {
        if (!this.dragState.isDragging) return false;

        const worldPos = this.controls.screenToWorld(p.mouseX, p.mouseY);

        if (this.dragState.dragTarget === 'node' && this.dragState.draggedNode) {
            const deltaX = worldPos.x - this.dragState.lastMousePos.x;
            const deltaY = worldPos.y - this.dragState.lastMousePos.y;
            
            this.dragState.draggedNode.move(deltaX, deltaY);
            this.dragState.lastMousePos = worldPos;
            return true;
        }

        return false;
    }

    handleMouseReleased(p: p5): void {
        if (!this.dragState.isDragging) return;

        if (this.dragState.dragTarget === 'connection' && this.dragState.connectionStart) {
            const worldPos = this.controls.screenToWorld(p.mouseX, p.mouseY);
            
            for (const node of this.nodes.values()) {
                const handle = node.getHandleAt(worldPos.x, worldPos.y);
                if (handle && handle !== this.dragState.connectionStart.handle) {
                    const startHandle = this.dragState.connectionStart.handle;
                    
                    if (startHandle.position === 'output' && handle.position === 'input') {
                        this.addConnection(
                            this.dragState.connectionStart.node.id,
                            startHandle.id,
                            node.id,
                            handle.id
                        );
                    } else if (startHandle.position === 'input' && handle.position === 'output') {
                        this.addConnection(
                            node.id,
                            handle.id,
                            this.dragState.connectionStart.node.id,
                            startHandle.id
                        );
                    }
                    break;
                }
            }
        }

        this.dragState = {
            isDragging: false,
            dragTarget: null,
            draggedNode: null,
            connectionStart: null,
            lastMousePos: { x: 0, y: 0 }
        };
    }

    handleKeyPressed(p: p5): void {
        const editingNode = Array.from(this.nodes.values()).find(n => n.isEditing);
        if (editingNode) {
            editingNode.handleInput(p.key);
            
            if (p.key === 'Enter') {
                editingNode.getOutputHandles().forEach(outputHandle => {
                    outputHandle.connectionIds.forEach(connectionId => {
                        const connection = this.connections.get(connectionId);
                        if (connection) {
                            this.propagateValue(editingNode.id, connection.connection.targetNodeId, connection.connection.targetHandleId);
                        }
                    });
                });
            }
            return;
        }
        
        if (p.key === 'Delete' || p.key === 'Backspace') {
            const selectedNodes = Array.from(this.nodes.values()).filter(n => n.selected);
            selectedNodes.forEach(node => this.removeNode(node.id));
        }
    }

    draw(p: p5, zoom: number): void {
        this.connections.forEach(connection => {
            const sourceNode = this.nodes.get(connection.connection.sourceNodeId);
            const targetNode = this.nodes.get(connection.connection.targetNodeId);
            
            if (sourceNode && targetNode) {
                connection.draw(p, sourceNode, targetNode, zoom);
            }
        });

        if (this.dragState.isDragging && this.dragState.connectionStart) {
            const startPos = this.dragState.connectionStart.node.getHandlePosition(
                this.dragState.connectionStart.handle.id
            );
            const worldMouse = this.controls.screenToWorld(p.mouseX, p.mouseY);
            
            if (startPos) {
                const tempConnection = new Connection({
                    id: 'temp',
                    sourceNodeId: '',
                    sourceHandleId: '',
                    targetNodeId: '',
                    targetHandleId: '',
                    dataType: this.dragState.connectionStart.handle.dataType
                });
                
                tempConnection.drawPreview(p, startPos, worldMouse, 
                    this.dragState.connectionStart.handle.dataType, zoom);
            }
        }

        this.nodes.forEach(node => {
            node.draw(p, zoom);
        });
    }
}