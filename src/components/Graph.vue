<script
    setup
    lang="ts"
>
import { computed, ref, watch } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { useGraphStore } from '@/stores/GraphStore'
import GraphNode from './GraphNode.vue'
import GraphEdge from './GraphEdge.vue'

const graphStore = useGraphStore()
const { onConnect, fitView } = useVueFlow()

// Handle new connections
onConnect((connection) => {
    const edge = {
        id: `${connection.source}->${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'custom'
    }
    graphStore.addEdge(edge)
})

// Fit view when nodes change
watch(() => graphStore.nodes.length, () => {
    setTimeout(() => fitView(), 100)
}, { immediate: true })
</script>

<template>
    <div class="graph-container">
        <VueFlow
            v-model:nodes="graphStore.nodes"
            v-model:edges="graphStore.edges"
            class="vue-flow-container"
            :fit-view-on-init="true"
            :zoom-on-scroll="true"
            :pan-on-scroll="true"
            :connection-mode="ConnectionMode.Strict"
        >
            <Background />

            <template #node-custom="nodeProps">
                <GraphNode v-bind="nodeProps" />
            </template>

            <template #edge-custom="edgeProps">
                <GraphEdge v-bind="edgeProps" />
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
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>