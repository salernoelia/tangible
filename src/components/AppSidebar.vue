<script
    setup
    lang="ts"
>
import { Calendar, Home, Inbox, Search, Settings, Plus } from "lucide-vue-next"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import useDragAndDrop from '@/composables/useDragAndDrop'

const { onDragStart } = useDragAndDrop()
</script>

<template>
    <Sidebar>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Node Templates</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div
                                class="draggable-node js-node"
                                :draggable="true"
                                @dragstart="onDragStart($event, 'js')"
                            >
                                <Plus class="w-4 h-4" />
                                JavaScript Node
                            </div>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <div
                                class="draggable-node glsl-node"
                                :draggable="true"
                                @dragstart="onDragStart($event, 'glsl')"
                            >
                                <Plus class="w-4 h-4" />
                                GLSL Node
                            </div>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <div
                                class="draggable-node wgsl-node"
                                :draggable="true"
                                @dragstart="onDragStart($event, 'wgsl')"
                            >
                                <Plus class="w-4 h-4" />
                                WGSL Node
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>Current Nodes</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <slot />
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
</template>

<style scoped>
.draggable-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    cursor: grab;
    user-select: none;
    transition: all 0.2s;
    background: white;
    font-size: 12px;
}

.draggable-node:hover {
    border-color: #999;
    background: #f9f9f9;
}

.draggable-node:active {
    cursor: grabbing;
}
</style>