<script
    setup
    lang="ts"
>
import { globalExecutionContext } from '@/services/ExecutionContext'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const variables = ref<[string, any][]>([])
const shaders = ref<[string, string][]>([])

const updateContext = () => {
    variables.value = globalExecutionContext.getAllVariables()
    shaders.value = globalExecutionContext.getAllShaders()
}

let intervalId: number | null = null

onMounted(() => {
    updateContext()
    intervalId = setInterval(updateContext, 500)
})

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId)
    }
})

const formatValue = (value: any) => {
    if (Array.isArray(value)) {
        return `[${value.join(', ')}]`
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 1).replace(/\n/g, ' ')
    }
    return String(value)
}

const hasContent = computed(() => variables.value.length > 0 || shaders.value.length > 0)
</script>

<template>
    <div
        v-if="hasContent"
        class="context-inspector"
    >
        <h4 class="inspector-title">Available Context</h4>

        <div
            v-if="variables.length > 0"
            class="context-section"
        >
            <h5 class="section-title">Variables</h5>
            <div
                v-for="[name, value] in variables"
                :key="name"
                class="context-item"
            >
                <span class="item-name">{{ name }}</span>
                <span class="item-value">{{ formatValue(value) }}</span>
            </div>
        </div>

        <div
            v-if="shaders.length > 0"
            class="context-section"
        >
            <h5 class="section-title">Shaders</h5>
            <div
                v-for="[name, source] in shaders"
                :key="name"
                class="context-item"
            >
                <span class="item-name">{{ name }}</span>
                <span class="item-value">{{ source.length }} chars</span>
            </div>
        </div>
    </div>

    <div
        v-else
        class="context-inspector empty"
    >
        <p class="empty-message">No context available. Add JS nodes to set variables.</p>
    </div>
</template>

<style scoped>
.context-inspector {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 11px;
    max-height: 200px;
    overflow-y: auto;
}

.context-inspector.empty {
    text-align: center;
    color: #666;
    font-style: italic;
}

.inspector-title {
    margin: 0 0 8px 0;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
}

.context-section {
    margin-bottom: 8px;
}

.section-title {
    margin: 0 0 4px 0;
    font-size: 10px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
}

.context-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 4px;
    background: white;
    border-radius: 3px;
    margin-bottom: 2px;
    border-left: 2px solid #007acc;
}

.item-name {
    font-weight: 600;
    color: #007acc;
    font-family: monospace;
}

.item-value {
    color: #666;
    font-family: monospace;
    font-size: 10px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-message {
    margin: 0;
    font-size: 10px;
}
</style>
