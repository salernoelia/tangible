import p5 from 'p5';
import type { Node } from './Node';
import type { DataType } from '../types/node';
import { MediaManager } from '../utils/MediaManager';

export class NodeRenderer {
    private mediaManager = MediaManager.getInstance();

    drawNode(p: p5, node: Node, zoom: number): void {
        const textScale = Math.max(0.8, Math.min(1.2, zoom));
        
        this.drawNodeBackground(p, node);
        this.drawNodeTitle(p, node, textScale);
        this.drawMediaPreview(p, node, textScale);
        this.drawHandles(p, node, textScale);
        
        if (node.hasInput) {
            this.drawInputField(p, node, textScale);
        }
        
        this.drawOutputValue(p, node, textScale);
        this.drawVideoControls(p, node, textScale);
        this.drawShaderControls(p, node, textScale);
    }

    private drawShaderControls(p: p5, node: Node, textScale: number): void {
        if (node.type === 'Shader') {
            const buttonX = node.position.x + node.width - 70;
            const buttonY = node.position.y + 35;
            const buttonW = 60;
            const buttonH = 20;
            
            p.fill(node.data.isEditorOpen ? 80 : 60);
            p.stroke(120);
            p.strokeWeight(1);
            p.rect(buttonX, buttonY, buttonW, buttonH, 3);
            
            p.fill(255);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(8 * textScale);
            p.text('EDIT', buttonX + buttonW/2, buttonY + buttonH/2);
        }
    }

    private drawVideoControls(p: p5, node: Node, textScale: number): void {
        if (node.type === 'Video' && node.data.mediaResource) {
            const controlsX = node.position.x + 10;
            const controlsY = node.position.y + 105;
            const controlSize = 15;
            
            p.stroke(150);
            p.strokeWeight(1);
            p.fill(node.data.autoplay ? 100 : 40);
            p.rect(controlsX, controlsY, controlSize, controlSize);
            
            if (node.data.autoplay) {
                p.stroke(255);
                p.strokeWeight(2);
                p.line(controlsX + 3, controlsY + 7, controlsX + 6, controlsY + 10);
                p.line(controlsX + 6, controlsY + 10, controlsX + 12, controlsY + 4);
            }
            
            p.fill(255);
            p.noStroke();
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(8 * textScale);
            p.text('Loop', controlsX + controlSize + 5, controlsY + controlSize/2);
        }
    }

    private drawMediaPreview(p: p5, node: Node, textScale: number): void {
        if (!['Image', 'Video', 'Camera', 'Shader', 'Output'].includes(node.type)) return;
        
        const previewX = node.position.x + 10;
        const previewY = node.position.y + 30;
        const previewW = node.width - 20;
        const previewH = node.data.isFullscreen ? p.height - 100 : 70;

        if (node.type === 'Image' && node.data.mediaResource) {
            this.drawMediaWithAspectRatio(p, node.data.mediaResource, previewX, previewY, previewW, previewH);
        } else if (node.type === 'Video' && node.data.mediaResource) {
            this.drawMediaWithAspectRatio(p, node.data.mediaResource, previewX, previewY, previewW, previewH);
            
            const isPlaying = node.data.mediaResource.isPlaying;
            p.fill(isPlaying ? 0 : 255, isPlaying ? 255 : 0, 0);
            p.noStroke();
            p.ellipse(previewX + previewW - 10, previewY + 10, 8, 8);
        } else if (node.type === 'Camera' && node.data.mediaResource) {
            this.drawMediaWithAspectRatio(p, node.data.mediaResource, previewX, previewY, previewW, previewH);
            
            p.fill(255, 0, 0);
            p.noStroke();
            p.ellipse(previewX + previewW - 10, previewY + 10, 8, 8);
            
            p.fill(255);
            p.textAlign(p.RIGHT, p.TOP);
            p.textSize(8 * textScale);
            p.text('LIVE', previewX + previewW - 15, previewY + 5);
        } else if (node.type === 'Shader') {
            const textureInput = node.inputValues.get(node.handles.find(h => h.id.includes('texture-in'))?.id || '');
            if (textureInput && textureInput.element) {
                if (node.outputValue && node.outputValue.element) {
                    this.drawMediaWithAspectRatio(p, node.outputValue, previewX, previewY, previewW, previewH);
                } else {
                    this.drawMediaWithAspectRatio(p, textureInput, previewX, previewY, previewW, previewH);
                }
                
                p.stroke(255, 100, 255);
                p.strokeWeight(2);
                p.noFill();
                p.rect(previewX, previewY, previewW, previewH);
                
                p.fill(255, 100, 255);
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(8 * textScale);
                p.text('SHADER', previewX + 5, previewY + 5);
            } else {
                this.drawPlaceholder(p, previewX, previewY, previewW, previewH, 'shader input', textScale);
            }
        } else if (node.type === 'Output') {
            const textureInput = node.inputValues.get(node.handles.find(h => h.id.includes('texture-in'))?.id || '');
            if (textureInput && textureInput.element) {
                if (node.data.isFullscreen) {
                    const fullscreenW = p.width - 40;
                    const fullscreenH = p.height - 80;
                    const fullscreenX = 20;
                    const fullscreenY = 40;
                    
                    p.fill(0, 200);
                    p.noStroke();
                    p.rect(0, 0, p.width, p.height);
                    
                    this.drawMediaWithAspectRatio(p, textureInput, fullscreenX, fullscreenY, fullscreenW, fullscreenH);
                    
                    p.fill(255);
                    p.textAlign(p.RIGHT, p.TOP);
                    p.textSize(16);
                    p.text('Press Ctrl+F to exit fullscreen', p.width - 20, 20);
                } else {
                    this.drawMediaWithAspectRatio(p, textureInput, previewX, previewY, previewW, previewH);
                    
                    p.stroke(255, 165, 0);
                    p.strokeWeight(2);
                    p.noFill();
                    p.rect(previewX, previewY, previewW, previewH);
                    
                    p.fill(255, 165, 0);
                    p.textAlign(p.LEFT, p.TOP);
                    p.textSize(8 * textScale);
                    p.text('OUTPUT', previewX + 5, previewY + 5);
                }
            } else {
                this.drawPlaceholder(p, previewX, previewY, previewW, previewH, 'no input', textScale);
            }
        } else {
            this.drawPlaceholder(p, previewX, previewY, previewW, previewH, node.type.toLowerCase(), textScale);
        }
    }

    private drawNodeBackground(p: p5, node: Node): void {
        p.fill(node.selected ? 70 : 50);
        p.stroke(node.selected ? 120 : 80);
        p.strokeWeight(1);
        p.rect(node.position.x, node.position.y, node.width, node.height, node.cornerRadius);
    }

    private drawNodeTitle(p: p5, node: Node, textScale: number): void {
        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14 * textScale);
        p.textStyle(p.BOLD);
        p.text(node.type, node.position.x + node.width / 2, node.position.y + 8);
    }

    private drawHandles(p: p5, node: Node, textScale: number): void {
        node.handles.forEach(handle => {
            const pos = node.getHandlePosition(handle.id);
            if (pos) {
                this.drawHandle(p, pos.x, pos.y, handle);
                this.drawHandleLabel(p, pos, handle, textScale, node);
            }
        });
    }

    private drawHandle(p: p5, x: number, y: number, handle: any): void {
        const color = this.getDataTypeColor(handle.dataType);
        
        p.fill(handle.connected ? color.r : 40, handle.connected ? color.g : 40, handle.connected ? color.b : 40);
        p.stroke(color.r, color.g, color.b);
        p.strokeWeight(2);
        p.ellipse(x, y, 16, 16);
        
        if (handle.connected) {
            p.fill(255);
            p.noStroke();
            p.ellipse(x, y, 8, 8);
        }
    }

    private drawHandleLabel(p: p5, pos: { x: number; y: number }, handle: any, textScale: number, node: Node): void {
        if (handle.position === 'input') {
            const inputValue = node.inputValues.get(handle.id);
            let displayText = this.getHandleName(handle);
            
            if (inputValue !== null && inputValue !== undefined) {
                if (typeof inputValue === 'object' && inputValue.type) {
                    displayText = inputValue.type === 'shader' ? 'Shader' : inputValue.type;
                } else if (typeof inputValue === 'number') {
                    displayText = inputValue.toFixed(2);
                } else if (typeof inputValue === 'string') {
                    displayText = inputValue.substring(0, 8);
                } else if (typeof inputValue === 'object') {
                    displayText = 'Media';
                } else {
                    displayText = String(inputValue);
                }
            }
            
            p.fill(255);
            p.noStroke();
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(10 * textScale);
            p.textStyle(p.NORMAL);
            p.text(displayText, pos.x + 20, pos.y);
        } else {
            const displayText = this.getHandleName(handle);
            
            p.fill(255);
            p.noStroke();
            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(10 * textScale);
            p.textStyle(p.NORMAL);
            p.text(displayText, pos.x - 20, pos.y);
        }
    }

    private drawInputField(p: p5, node: Node, textScale: number): void {
        this.drawStandardInputField(p, node, textScale);
    }

    private drawStandardInputField(p: p5, node: Node, textScale: number): void {
        const fieldX = node.position.x + 10;
        const fieldY = node.position.y + node.height - 35;
        const fieldWidth = node.width - 20;
        const fieldHeight = 25;
        
        p.fill(node.isEditing ? 80 : 60);
        p.stroke(node.isEditing ? 120 : 100);
        p.strokeWeight(1);
        p.rect(fieldX, fieldY, fieldWidth, fieldHeight, 3);
        
        p.fill(255);
        p.noStroke();
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(11 * textScale);
        p.textStyle(p.NORMAL);
        
        const displayValue = node.data.value !== undefined ? String(node.data.value) : '';
        p.text(displayValue, fieldX + 5, fieldY + fieldHeight / 2);
        
        if (node.isEditing) {
            p.stroke(255);
            p.strokeWeight(1);
            const textWidth = p.textWidth(displayValue);
            p.line(fieldX + 5 + textWidth + 2, fieldY + 5, fieldX + 5 + textWidth + 2, fieldY + fieldHeight - 5);
        }
    }

    private drawOutputValue(p: p5, node: Node, textScale: number): void {
        if (node.outputValue !== null && node.outputValue !== undefined) {
            p.fill(0, 150);
            p.noStroke();
            p.rect(node.position.x + node.width - 80, node.position.y + 12, 75, 16);
            
            p.fill(150, 255, 150);
            p.noStroke(); 
            p.textAlign(p.RIGHT);
            p.textSize(10 * textScale);
            p.textStyle(p.NORMAL);
            
            let displayValue = '';
            
            if (typeof node.outputValue === 'object' && node.outputValue.type) {
                displayValue = node.outputValue.type === 'shader' ? 'Shader' : node.outputValue.type;
            } else if (typeof node.outputValue === 'number') {
                displayValue = node.outputValue.toFixed(2);
            } else if (typeof node.outputValue === 'string') {
                displayValue = node.outputValue.substring(0, 10);
            } else if (typeof node.outputValue === 'object') {
                displayValue = 'Media';
            } else {
                displayValue = String(node.outputValue);
            }
            
            p.text(displayValue, node.position.x + node.width - 5, node.position.y + 20);
        }
    }

    private drawMediaWithAspectRatio(p: p5, resource: any, x: number, y: number, w: number, h: number): void {
        if (!resource || !resource.element || !resource.isLoaded) {
            this.drawPlaceholder(p, x, y, w, h, resource?.type || 'loading', 1);
            return;
        }

        try {
            const mediaWidth = resource.width || 640;
            const mediaHeight = resource.height || 480;
            const mediaAspect = mediaWidth / mediaHeight;
            const containerAspect = w / h;

            let drawW, drawH, drawX, drawY;

            if (mediaAspect > containerAspect) {
                drawW = w;
                drawH = w / mediaAspect;
                drawX = x;
                drawY = y + (h - drawH) / 2;
            } else {
                drawW = h * mediaAspect;
                drawH = h;
                drawX = x + (w - drawW) / 2;
                drawY = y;
            }

            p.fill(0);
            p.noStroke();
            p.rect(x, y, w, h);

            this.mediaManager.drawMedia(p, resource, drawX, drawY, drawW, drawH);
        } catch (error) {
            console.warn('Error drawing media with aspect ratio:', error);
            this.drawPlaceholder(p, x, y, w, h, 'error', 1);
        }
    }

    private drawPlaceholder(p: p5, x: number, y: number, w: number, h: number, type: string, textScale: number): void {
        p.fill(60);
        p.stroke(100);
        p.strokeWeight(1);
        p.rect(x, y, w, h);
        
        p.fill(200);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(10 * textScale);
        p.text(type.toUpperCase(), x + w/2, y + h/2);
    }

    private getHandleName(handle: any): string {
        const parts = handle.id.split('-');
        if (parts.length >= 2) {
            return parts[parts.length - 1];
        }
        return handle.position === 'input' ? 'in' : 'out';
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

    isPointInShaderEditButton(node: Node, x: number, y: number): boolean {
        if (node.type !== 'Shader') return false;
        
        const buttonX = node.position.x + node.width - 70;
        const buttonY = node.position.y + 35;
        const buttonW = 60;
        const buttonH = 20;
        
        return x >= buttonX && x <= buttonX + buttonW && y >= buttonY && y <= buttonY + buttonH;
    }
}