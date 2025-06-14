<template>
    <div
        class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-gray-950 rounded-2xl flex flex-col p-4 border gap-4 border-gray-800">
        <input
            v-model="searchTerm"
            ref="searchRef"
            class="bg-gray-700 rounded-sm p-2 text-white placeholder-gray-400 border border-gray-600 focus:border-gray-500 focus:outline-none"
            placeholder="Search..."
            autofocus
        />

        <div class="flex-1 overflow-auto">
            <div
                class="grid gap-2 h-full p-2 rounded-lg"
                style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); grid-auto-rows: 120px;"
            >
                <div
                    v-for="(node, index) in filteredNodes"
                    :key="index"
                    class="bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors duration-150 p-3 rounded-sm group"
                    @click="selectNode(node)"
                >
                    <div :class="`w-3 h-3 rounded-sm ${node.color} mb-2`"></div>
                    <div class="text-white text-sm font-medium">{{ node.name }}</div>
                    <div class="text-gray-400 text-xs">{{ node.category }}</div>
                </div>
            </div>

            <div
                v-if="filteredNodes.length === 0 && searchTerm"
                class="text-gray-400 text-center py-8"
            >
                No nodes found matching "{{ searchTerm }}"
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { getAvailableNodeTypes } from '../canvas/Node'
import { watch, onMounted, onUnmounted } from 'vue'

const searchRef = useTemplateRef('searchRef')
const searchTerm = ref('')
const nodeTypes = getAvailableNodeTypes()

const filteredNodes = computed(() => {
    const term = searchTerm.value.toLowerCase().trim()
    if (!term) return nodeTypes

    return nodeTypes.filter(node =>
        node.name.toLowerCase().includes(term) ||
        node.category.toLowerCase().includes(term)
    )
})



const selectNode = (node: any) => {
    document.dispatchEvent(new CustomEvent('node-selected', {
        detail: { nodeType: node.name }
    }))
}

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && filteredNodes.value.length > 0) {
        selectNode(filteredNodes.value[0])
    }
}


onMounted(() => {
    if (searchRef.value) {
        searchRef.value.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
})

watch(() => searchRef.value, (newSearchRef) => {
    if (newSearchRef) {
        setTimeout(() => {
            newSearchRef.focus()
        }, 0)
    }
})
</script>