<template>
    <div class="flex-1 relative overflow-hidden">
        <div
            ref="p5Container"
            class="w-full h-full"
        ></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import p5 from 'p5';
import { NodeEditor } from '../canvas/NodeEditor';
import { CanvasControls, type CanvasState, type CanvasConfig } from '../utils/ControlsManager';
import { MediaManager } from '../utils/MediaManager';

const p5Container = ref<HTMLDivElement>();

const state: CanvasState = {
    zoom: { value: 1 },
    offsetX: { value: 0 },
    offsetY: { value: 0 },
    isDragging: { value: false },
    lastMouseX: { value: 0 },
    lastMouseY: { value: 0 }
};

const config: CanvasConfig = {
    minZoom: 0.1,
    maxZoom: 3,
    zoomSpeed: 1.1
};

let p5Instance: p5;
let nodeEditor: NodeEditor;
let controls: CanvasControls;

onMounted(() => {
    if (!p5Container.value) return;

    controls = new CanvasControls(state, config);
    nodeEditor = new NodeEditor(controls);

    p5Instance = new p5((p: p5) => {
        p.setup = () => {
            const canvas = p.createCanvas(p5Container.value!.clientWidth, p5Container.value!.clientHeight);
            canvas.parent(p5Container.value!);

            MediaManager.getInstance().setP5Instance(p);

            p.textFont('Arial');
        };

        p.draw = () => {
            p.background(30);

            p.push();
            p.translate(state.offsetX.value, state.offsetY.value);
            p.scale(state.zoom.value);

            drawGrid(p);
            nodeEditor.draw(p, state.zoom.value);

            p.pop();
        };

        p.mousePressed = () => {
            let handled = nodeEditor.handleMousePressed(p);
            if (!handled) {
                handled = controls.handleMousePressed(p);
            }
            return false;
        };

        p.mouseDragged = () => {
            let handled = nodeEditor.handleMouseDragged(p);
            if (!handled) {
                handled = controls.handleMouseDragged(p);
            }
            return false;
        };

        p.mouseReleased = () => {
            nodeEditor.handleMouseReleased(p);
            controls.handleMouseReleased();
        };

        p.mouseWheel = (event: any) => {
            controls.handleMouseWheel(p, event);
            return false;
        };

        p.keyPressed = () => {
            nodeEditor.handleKeyPressed(p);
            controls.handleKeyPressed(p);
        };

        p.windowResized = () => {
            p.resizeCanvas(p5Container.value!.clientWidth, p5Container.value!.clientHeight);
        };
    });
});

const drawGrid = (p: p5) => {
    const gridSize = 50;
    const zoom = state.zoom.value;
    const offsetX = state.offsetX.value;
    const offsetY = state.offsetY.value;

    if (zoom < 0.5) return;

    const startX = Math.floor(-offsetX / zoom / gridSize) * gridSize;
    const startY = Math.floor(-offsetY / zoom / gridSize) * gridSize;
    const endX = startX + (p.width / zoom) + gridSize;
    const endY = startY + (p.height / zoom) + gridSize;

    p.stroke(40);
    p.strokeWeight(1 / zoom);

    for (let x = startX; x <= endX; x += gridSize) {
        p.line(x, startY, x, endY);
    }

    for (let y = startY; y <= endY; y += gridSize) {
        p.line(startX, y, endX, y);
    }
};

onUnmounted(() => {
    if (p5Instance) {
        p5Instance.remove();
    }
    MediaManager.getInstance().stopCamera();
});
</script>
<style scoped>
.dot-grid-board {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    cursor: grab;
    user-select: none;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}
</style>