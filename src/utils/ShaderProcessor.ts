import p5 from 'p5';
import type { MediaResource } from './MediaManager';

export class ShaderProcessor {
    private static instance: ShaderProcessor;
    private p5Instance: p5 | null = null;
    private shaderCache = new Map<string, p5.Shader>();
    private renderBuffers = new Map<string, p5.Graphics>();
    private lastProcessTime = new Map<string, number>();

    static getInstance(): ShaderProcessor {
        if (!ShaderProcessor.instance) {
            ShaderProcessor.instance = new ShaderProcessor();
        }
        return ShaderProcessor.instance;
    }

    setP5Instance(p: p5): void {
        this.p5Instance = p;
    }

    processTexture(
        sourceTexture: MediaResource,
        fragmentShaderCode: string,
        params: Record<string, any>,
        outputId: string
    ): MediaResource | null {
        if (!this.p5Instance || !sourceTexture.element) {
            return null;
        }

        // Performance optimization: limit shader processing to ~30fps for live sources
        const now = Date.now();
        const lastTime = this.lastProcessTime.get(outputId) || 0;
        const isLiveSource = sourceTexture.type === 'video' || sourceTexture.type === 'camera';
        
        if (isLiveSource && now - lastTime < 33) { // ~30fps limit
            // Return cached result if processing too frequently
            const existing = this.renderBuffers.get(outputId);
            if (existing) {
                return {
                    id: outputId,
                    type: 'shader',
                    element: existing,
                    isLoaded: true,
                    width: sourceTexture.width,
                    height: sourceTexture.height
                };
            }
        }

        this.lastProcessTime.set(outputId, now);

        try {
            const shaderKey = this.hashShader(fragmentShaderCode);
            let shader = this.shaderCache.get(shaderKey);

            if (!shader) {
                const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}`;

                shader = this.p5Instance.createShader(vertexShader, fragmentShaderCode);
                if (shader) {
                    this.shaderCache.set(shaderKey, shader);
                } else {
                    console.error('Failed to compile shader');
                    return sourceTexture;
                }
            }

            if (!shader) {
                console.error('Failed to create shader');
                return sourceTexture;
            }

            let buffer = this.renderBuffers.get(outputId);
            if (!buffer || buffer.width !== sourceTexture.width || buffer.height !== sourceTexture.height) {
                if (buffer) {
                    buffer.remove();
                }
                // Use smaller resolution for performance
                const renderWidth = Math.min(512, sourceTexture.width);
                const renderHeight = Math.min(512, sourceTexture.height);
                buffer = this.p5Instance.createGraphics(renderWidth, renderHeight, this.p5Instance.WEBGL);
                this.renderBuffers.set(outputId, buffer);
            }

            buffer.shader(shader);

            // Set uniforms
            shader.setUniform('u_texture', sourceTexture.element as p5.Graphics | p5.MediaElement | p5.Image);
            shader.setUniform('u_resolution', [buffer.width, buffer.height]);
            shader.setUniform('u_time', params.time || this.p5Instance.millis() / 1000.0);
            shader.setUniform('u_param1', params.param1 || 1.0);
            shader.setUniform('u_param2', params.param2 || 1.0);
            shader.setUniform('u_param3', params.param3 || 1.0);

            buffer.rect(0, 0, buffer.width, buffer.height);

            const processedResource: MediaResource = {
                id: outputId,
                type: 'shader',
                element: buffer,
                isLoaded: true,
                width: buffer.width,
                height: buffer.height
            };

            return processedResource;
        } catch (error) {
            console.error('Shader processing error:', error);
            return sourceTexture;
        }
    }

    private hashShader(code: string): string {
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            const char = code.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    cleanup(): void {
        this.renderBuffers.forEach(buffer => buffer.remove());
        this.renderBuffers.clear();
        this.shaderCache.clear();
    }
}