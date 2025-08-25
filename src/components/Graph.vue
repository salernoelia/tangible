<script
    setup
    lang="ts"
>
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import GraphNode from './GraphNode.vue'
import GraphEdge from './GraphEdge.vue'

// Initialize the VueFlow instance
const { fitView } = useVueFlow()

// these are our nodes
const nodes = ref<Node[]>([
    {
        id: '1',
        type: 'input',
        position: { x: 250, y: 5 },
        data: { label: 'Node 1' },
    },
    {
        id: '2',
        position: { x: 100, y: 100 },
        data: { label: 'Node 2' },
    },
    {
        id: '3',
        type: 'output',
        position: { x: 400, y: 200 },
        data: { label: 'Node 3' },
    },
    {
        id: '4',
        type: 'special',
        position: { x: 200, y: 300 },
        data: {
            label: 'Node 4',
            hello: 'world',
        },
    },
])

// these are our edges
const edges = ref<Edge[]>([
    {
        id: 'e1->2',
        source: '1',
        target: '2',
    },
    {
        id: 'e2->3',
        source: '2',
        target: '3',
        animated: true,
    },
    {
        id: 'e3->4',
        type: 'special',
        source: '3',
        target: '4',
        data: {
            hello: 'world',
        }
    },
])

// Fit view when component mounts
setTimeout(() => {
    fitView()
}, 100)
</script>

<template>
    <div class="graph-container">
        <VueFlow
            :nodes="nodes"
            :edges="edges"
            class="vue-flow-container"
            :fit-view-on-init="true"
            :zoom-on-scroll="true"
            :pan-on-scroll="true"
        >
            <Background />
            <template #node-special="specialNodeProps">
                <GraphNode v-bind="specialNodeProps" />
            </template>

            <template #edge-special="specialEdgeProps">
                <GraphEdge v-bind="specialEdgeProps" />
            </template>
        </VueFlow>
    </div>
</template>

<style scoped>
.graph-container {
    width: 100%;
    height: 100%;

}

.vue-flow-container {
    width: 100%;
    height: 100%;
}
</style>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>