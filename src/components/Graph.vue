<script
    setup
    lang="ts"
>
import { VueFlow, useVueFlow, ConnectionMode } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { useGraphStore } from '@/stores/GraphStore'
import GraphNode from './GraphNode.vue'
import GraphEdge from './GraphEdge.vue'
import useDragAndDrop from '@/composables/useDragAndDrop'

const graphStore = useGraphStore()
const { onConnect, onNodeDragStop } = useVueFlow()
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()

onConnect((connection) => {
    const edge = {
        id: `${connection.source}->${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'custom'
    }
    graphStore.addEdge(edge)
})

onNodeDragStop((event) => {
    event.nodes.forEach(node => {
        graphStore.updateNodePosition(node.id, node.position)
    })
})
</script>

<template>
    <div
        class="graph-container"
        @drop="onDrop"
    >
        <VueFlow
            v-model:nodes="graphStore.flowNodes"
            v-model:edges="graphStore.flowEdges"
            class="vue-flow-container"
            :fit-view-on-init="true"
            :zoom-on-scroll="true"
            :pan-on-scroll="true"
            :connection-mode="ConnectionMode.Strict"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
        >
            <Background :style="{
                backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
                transition: 'background-color 0.2s ease',
            }" />

            <template #node-custom="nodeProps">
                <GraphNode v-bind="nodeProps" />
            </template>

            <template #edge-custom="edgeProps">
                <GraphEdge v-bind="edgeProps" />
            </template>

            <div
                v-if="isDragOver"
                class="drop-overlay"
            >
                <p>Drop here to create node</p>
            </div>
        </VueFlow>
    </div>
</template>

<style scoped>
.graph-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.vue-flow-container {
    width: 100%;
    height: 100%;
}

.drop-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #0066cc;
    pointer-events: none;
    z-index: 1000;
}

.drop-overlay p {
    margin: 0;
    font-weight: 600;
    color: #0066cc;
}
</style>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>