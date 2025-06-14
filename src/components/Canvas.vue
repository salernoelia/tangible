<template>
    <div
        ref="canvasContainer"
        class="dot-grid-board"
        :style="containerStyle"
    ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import p5 from 'p5'
import { drawOptimizedDotGrid } from '../canvas/drawOptimizedDotGrid'
import { CanvasControls, type CanvasState, type CanvasConfig } from '../utils/controls'
import { NodeEditor } from '../canvas/nodeEditor'

const canvasContainer = ref<HTMLElement>()

const zoom = ref(1.0)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

const baseGridSpacing = 23
const baseDotSize = 1.5

const canvasConfig: CanvasConfig = {
    minZoom: 1.0,
    maxZoom: 3.0,
    zoomSpeed: 1.15
}

const canvasState: CanvasState = {
    zoom,
    offsetX,
    offsetY,
    isDragging,
    lastMouseX,
    lastMouseY
}

const containerStyle = `
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    cursor: grab;
    user-select: none;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  `

let p5Instance: p5 | null = null
let controls: CanvasControls
let nodeEditor: NodeEditor
let lastDrawnBounds = { startX: 0, endX: 0, startY: 0, endY: 0 }

onMounted(() => {
    controls = new CanvasControls(canvasState, canvasConfig)
    nodeEditor = new NodeEditor(controls)

    const sketch = (p: p5) => {
        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight)
            p.colorMode(p.RGB)
            p.pixelDensity(1)
        }

        p.draw = () => {
            p.background(20, 20, 20)
            p.push()

            p.translate(offsetX.value, offsetY.value)
            p.scale(zoom.value)

            const effectiveGridSpacing = baseGridSpacing * zoom.value
            const effectiveDotSize = Math.max(0.5, baseDotSize * zoom.value)

            drawOptimizedDotGrid(p, zoom, offsetX, offsetY, baseGridSpacing, { value: effectiveDotSize }, lastDrawnBounds)

            nodeEditor.draw(p, zoom.value)

            p.pop()

            drawUI(p)
        }

        p.mousePressed = () => {
            const nodeHandled = nodeEditor.handleMousePressed(p)
            if (!nodeHandled) {
                return controls.handleMousePressed(p)
            }
            return false
        }

        p.mouseDragged = () => {
            const nodeHandled = nodeEditor.handleMouseDragged(p)
            if (!nodeHandled) {
                return controls.handleMouseDragged(p)
            }
            return false
        }

        p.mouseReleased = () => {
            nodeEditor.handleMouseReleased(p)
            controls.handleMouseReleased()
        }

        p.mouseWheel = (event: any) => controls.handleMouseWheel(p, event)

        p.keyPressed = () => {
            nodeEditor.handleKeyPressed(p)
            controls.handleKeyPressed(p)
        }

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight)
        }

        function drawUI(p: p5) {
            p.fill(0, 0, 0, 150)
            p.noStroke()
            p.rect(10, 10, 140, 30, 5)

            p.fill(255)
            p.textAlign(p.LEFT, p.CENTER)
            p.textSize(14)
            p.text(`Zoom: ${(zoom.value * 100).toFixed(1)}%`, 20, 25)

            p.fill(0, 0, 0, 100)
            p.rect(10, 50, 200, 30, 5)

            p.fill(255)
            p.textSize(10)
            p.text(`FPS: ${p.frameRate().toFixed(1)}`, 20, 65)

            p.fill(0, 0, 0, 100)
            p.rect(10, p.height - 120, 300, 110, 5)

            p.fill(255)
            p.textSize(11)
            p.text('Node Editor Controls:', 20, p.height - 105)
            p.text('N: Create Number node', 20, p.height - 90)
            p.text('M: Create Math node', 20, p.height - 75)
            p.text('Drag handles to connect', 20, p.height - 60)
            p.text('Delete: Remove selected nodes', 20, p.height - 45)
            p.text('Mouse wheel: Zoom', 20, p.height - 30)
            p.text('Spacebar: Reset view', 20, p.height - 15)
        }
    }

    if (canvasContainer.value) {
        p5Instance = new p5(sketch, canvasContainer.value)
    }
})

onUnmounted(() => {
    if (p5Instance) {
        p5Instance.remove()
    }
})
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