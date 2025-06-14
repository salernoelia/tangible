import p5 from 'p5';

export interface CanvasState {
    zoom: { value: number };
    offsetX: { value: number };
    offsetY: { value: number };
    isDragging: { value: boolean };
    lastMouseX: { value: number };
    lastMouseY: { value: number };
}

export interface CanvasConfig {
    minZoom: number;
    maxZoom: number;
    zoomSpeed: number;
}

export class CanvasControls {
    private state: CanvasState;
    private config: CanvasConfig;

    constructor(state: CanvasState, config: CanvasConfig) {
        this.state = state;
        this.config = config;
    }

    handleMousePressed(p: p5): boolean {
        this.state.isDragging.value = true;
        this.state.lastMouseX.value = p.mouseX;
        this.state.lastMouseY.value = p.mouseY;
        return false;
    }

    handleMouseDragged(p: p5): boolean {
        if (p.key === ' ') {
            if (this.state.isDragging.value) {
                const deltaX = p.mouseX - this.state.lastMouseX.value;
                const deltaY = p.mouseY - this.state.lastMouseY.value;
                
                this.state.offsetX.value += deltaX;
                this.state.offsetY.value += deltaY;
                
                this.state.lastMouseX.value = p.mouseX;
                this.state.lastMouseY.value = p.mouseY;
            }
        }

        return false;
    }

    handleMouseReleased(): void {
        this.state.isDragging.value = false;
    }

    handleMouseWheel(p: p5, event: any): boolean {
        // Calculate world coordinates before zoom
        const mouseWorldX = (p.mouseX - this.state.offsetX.value) / this.state.zoom.value;
        const mouseWorldY = (p.mouseY - this.state.offsetY.value) / this.state.zoom.value;
        
        // Apply zoom with configured speed
        if (event.delta > 0) {
            this.state.zoom.value = Math.max(this.config.minZoom, this.state.zoom.value / this.config.zoomSpeed);
        } else {
            this.state.zoom.value = Math.min(this.config.maxZoom, this.state.zoom.value * this.config.zoomSpeed);
        }
        
        // Adjust offset to zoom towards mouse position
        this.state.offsetX.value = p.mouseX - mouseWorldX * this.state.zoom.value;
        this.state.offsetY.value = p.mouseY - mouseWorldY * this.state.zoom.value;
        
        return false;
    }

    handleKeyPressed(p: p5): void {
        if (p.key === 'e') { 
            document.dispatchEvent(new CustomEvent('toggle-node-picker'));
        }
        
        if (p.key === '+' || p.key === '=') {
            this.zoomIn();
        }
        if (p.key === '-') {
            this.zoomOut();
        }
    }

    zoomIn(): void {
        this.state.zoom.value = Math.min(this.config.maxZoom, this.state.zoom.value * 1.2);
    }

    zoomOut(): void {
        this.state.zoom.value = Math.max(this.config.minZoom, this.state.zoom.value / 1.2);
    }

    // Utility methods for getting current state
    getCurrentZoom(): number {
        return this.state.zoom.value;
    }

    getCurrentOffset(): { x: number; y: number } {
        return { x: this.state.offsetX.value, y: this.state.offsetY.value };
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        const worldX = (screenX - this.state.offsetX.value) / this.state.zoom.value;
        const worldY = (screenY - this.state.offsetY.value) / this.state.zoom.value;
        return { x: worldX, y: worldY };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        const screenX = worldX * this.state.zoom.value + this.state.offsetX.value;
        const screenY = worldY * this.state.zoom.value + this.state.offsetY.value;
        return { x: screenX, y: screenY };
    }
}