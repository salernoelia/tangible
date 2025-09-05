<script
    setup
    lang="ts"
>
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import useDragAndDrop from '@/composables/useDragAndDrop'
import { useGraphStore } from '@/stores/GraphStore'

const { onDragStart } = useDragAndDrop()
const graphStore = useGraphStore()

const templates = [
    { type: 'js' as const, label: 'JavaScript', color: '#3178c6' },
    { type: 'p5' as const, label: 'P5.js Canvas', color: '#ff6b6b' },
    { type: 'glsl' as const, label: 'GLSL Shader', color: '#8b5a3c' },
    { type: 'wgsl' as const, label: 'WGSL Shader', color: '#7c4dff' }
]
</script>

<template>
    <Sidebar>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Node Templates</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem
                            v-for="template in templates"
                            :key="template.type"
                        >
                            <div
                                class="template-node"
                                :style="{ borderColor: template.color }"
                                :draggable="true"
                                @dragstart="onDragStart($event, template.type)"
                            >
                                <div
                                    class="template-indicator"
                                    :style="{ backgroundColor: template.color }"
                                ></div>
                                {{ template.label }}
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <template v-for="lang in ['js', 'p5', 'glsl', 'wgsl']">
                            <SidebarMenuItem
                                :key="lang + '-group'"
                                v-if="graphStore.canvasNodes.some(node => node.lang === lang)"
                            >
                                <SidebarGroupLabel>{{ lang.toUpperCase() }}</SidebarGroupLabel>
                            </SidebarMenuItem>
                            <SidebarMenuItem
                                v-for="node in graphStore.canvasNodes.filter(n => n.lang === lang)"
                                :key="node.id"
                            >
                                <button
                                    class="node-item"
                                    :class="{ active: graphStore.currentNodeId === node.id }"
                                    @click="graphStore.selectNode(node.id)"
                                >
                                    <div
                                        class="node-indicator"
                                        :class="`lang-${node.lang}`"
                                    ></div>
                                    {{ node.id }}
                                </button>
                            </SidebarMenuItem>
                        </template>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
</template>

<style scoped>
.template-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 2px solid;
    border-radius: 6px;
    cursor: grab;
    user-select: none;
    transition: all 0.2s;
    background: white;
    font-size: 12px;
}

.template-node:hover {
    background: #f9f9f9;
    transform: translateY(-1px);
}

.template-node:active {
    cursor: grabbing;
}

.template-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.node-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.node-item:hover {
    background: #f0f0f0;
}

.node-item.active {
    background: #e7f3ff;
    font-weight: 600;
}

.node-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.lang-js {
    background: #3178c6;
}

.lang-p5 {
    background: #ff6b6b;
}

.lang-glsl {
    background: #8b5a3c;
}

.lang-wgsl {
    background: #7c4dff;
}
</style>