<script
    setup
    lang="ts"
>
import { Position, Handle } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import { useGraphStore } from '@/stores/GraphStore'

defineProps<NodeProps>()
const graphStore = useGraphStore()

const langColors = {
    js: '#3178c6',
    p5: '#ff6b6b',
    glsl: '#8b5a3c',
    wgsl: '#7c4dff'
}
</script>

<template>
    <div
        class="custom-node"
        :class="{ active: graphStore.currentNodeId === data.label }"
        @click="graphStore.selectNode(data.label)"
    >
        <div class="node-header">
            <span class="node-title">{{ data.label }}</span>
            <span
                class="node-lang"
                :style="{ backgroundColor: langColors[data.lang as keyof typeof langColors] }"
            >
                {{ data.lang }}
            </span>
        </div>

        <div class="node-content">
            <code>{{ data.content?.slice(0, 50) }}{{ data.content?.length > 50 ? '...' : '' }}</code>
        </div>

        <Handle
            type="target"
            :position="Position.Left"
            class="node-handle target"
        />

        <Handle
            type="source"
            :position="Position.Right"
            class="node-handle source"
        />
    </div>
</template>

<style scoped>
.custom-node {
    background: white;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    min-width: 150px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    cursor: pointer;
}

.custom-node:hover {
    border-color: #999;
}

.custom-node.active {
    border-color: #a0a0a0;

}

.node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.node-title {
    font-weight: 600;
    font-size: 14px;
}

.node-lang {
    font-size: 10px;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: bold;
}

.node-content {
    font-size: 12px;
    color: #666;
    background: #f8f8f8;
    padding: 6px;
    border-radius: 4px;
    font-family: monospace;
}

.node-handle {
    width: 12px;
    height: 12px;
    border: 1px solid #666;
}

.node-handle.target {
    background: #ffffff;
}

.node-handle.source {
    background: #3c3b3d;
}
</style>