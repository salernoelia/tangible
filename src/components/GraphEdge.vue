<script
    setup
    lang="ts"
>
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps<EdgeProps>()

const path = computed(() => getBezierPath(props))
</script>


<template>
    <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
    <BaseEdge
        :path="path[0]"
        class="custom-edge"
    />

    <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
    <EdgeLabelRenderer>

    </EdgeLabelRenderer>
</template>

<style scoped>
.custom-edge {
    stroke: #999;
    stroke-width: 2;

}

.edge-label {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.edge-connection {
    color: #666;
    font-weight: bold;
}
</style>