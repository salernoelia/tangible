<script
    setup
    lang="ts"
>


import { Position, Handle } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import { useStorage } from '@vueuse/core';


const props = defineProps<NodeProps>()

const current_node_id = useStorage("current-editor-id", "node-1")


</script>

<template>
    <div
        class="custom-node"
        @click="current_node_id = data.label"
    >
        <div class="node-header">
            <span class="node-title">{{ data.label }}</span>
            <span class="node-lang">{{ data.lang }}</span>
        </div>

        <div class="node-content">
            <code>{{ data.content?.slice(0, 50) }}{{ data.content?.length > 50 ? '...' : '' }}</code>

        </div>




        <Handle
            type="target"
            :position="Position.Right"
            class="node-handle target"
        />

        <Handle
            type="source"
            :position="Position.Left"
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
}

.custom-node:hover {
    border-color: #999;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.custom-node.selected {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
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
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
}

.node-content {
    font-size: 12px;
    color: #666;
    background: #f8f8f8;
    padding: 6px;
    border-radius: 4px;
    margin-bottom: 8px;
    font-family: monospace;
}

.node-position {
    font-size: 10px;
    color: #999;
}

.node-handle {
    width: 12px;
    height: 12px;
    border: 1px solid #666;
}

.node-handle.target {
    background: #d0f4dd;
}

.node-handle.source {
    background: #e8d5d5;
}
</style>