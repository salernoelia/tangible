<!-- filepath: /Users/eliasalerno/GitHub/tangible/src/components/ShaderEditor.vue -->
<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
        <div class="bg-gray-900 w-[90vw] h-[90vh] rounded-lg flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 class="text-white text-xl font-bold">Shader Editor</h2>
                <button
                    @click="close"
                    class="text-gray-400 hover:text-white"
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>
            </div>

            <div class="flex flex-1 overflow-hidden">
                <div class="flex-1 p-4">
                    <textarea
                        ref="textareaRef"
                        v-model="shaderCode"
                        class="w-full h-full bg-gray-800 text-white font-mono text-sm p-4 border border-gray-600 rounded resize-none focus:outline-none focus:border-blue-500"
                        spellcheck="false"
                        @input="onInput"
                        @keydown="handleKeyDown"
                        placeholder="Write your fragment shader here..."
                    ></textarea>
                </div>

                <div class="w-px bg-gray-700"></div>

                <div class="w-80 p-4 overflow-y-auto">
                    <h3 class="text-white font-semibold mb-4">Uniforms</h3>

                    <div class="space-y-4">
                        <div>
                            <label class="text-gray-300 text-sm">u_time</label>
                            <div class="text-gray-500 text-xs">Automatic time value</div>
                        </div>

                        <div>
                            <label class="text-gray-300 text-sm">u_param1</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                v-model="params.param1"
                                class="w-full mt-1"
                            >
                            <div class="text-gray-400 text-xs">{{ params.param1 }}</div>
                        </div>

                        <div>
                            <label class="text-gray-300 text-sm">u_param2</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                v-model="params.param2"
                                class="w-full mt-1"
                            >
                            <div class="text-gray-400 text-xs">{{ params.param2 }}</div>
                        </div>

                        <div>
                            <label class="text-gray-300 text-sm">u_param3</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                v-model="params.param3"
                                class="w-full mt-1"
                            >
                            <div class="text-gray-400 text-xs">{{ params.param3 }}</div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <h3 class="text-white font-semibold mb-2">Compilation</h3>
                        <div
                            v-if="compileError"
                            class="text-red-400 text-xs bg-red-900 bg-opacity-30 p-2 rounded"
                        >
                            {{ compileError }}
                        </div>
                        <div
                            v-else
                            class="text-green-400 text-xs"
                        >
                            Shader compiled successfully
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-gray-700 flex justify-end space-x-3">
                <button
                    @click="close"
                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                    Cancel
                </button>
                <button
                    @click="apply"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    :disabled="!!compileError"
                >
                    Apply
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, useTemplateRef } from 'vue';

const props = defineProps<{
    isVisible: boolean;
    initialCode: string;
    initialParams: Record<string, number>;
}>();

const emit = defineEmits<{
    close: [];
    apply: [code: string, params: Record<string, number>];
}>();

const textareaRef = useTemplateRef('textareaRef');
const shaderCode = ref(props.initialCode);
const params = ref({
    param1: 1.0,
    param2: 1.0,
    param3: 1.0,
    ...props.initialParams
});
const compileError = ref('');

const validateShader = (code: string) => {
    // Basic validation - just check for gl_FragColor
    if (!code.includes('gl_FragColor')) {
        return 'Missing gl_FragColor assignment';
    }

    return '';
};

const onInput = () => {
    compileError.value = validateShader(shaderCode.value);
};

const handleKeyDown = (e: KeyboardEvent) => {
    // Handle tab key for proper indentation
    if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = textareaRef.value;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            shaderCode.value = shaderCode.value.substring(0, start) + '    ' + shaderCode.value.substring(end);

            nextTick(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            });
        }
    }
};

const close = () => {
    emit('close');
};

const apply = () => {
    if (!compileError.value) {
        emit('apply', shaderCode.value, { ...params.value });
    }
};

// Focus the textarea when the editor opens
watch(() => props.isVisible, (visible) => {
    if (visible) {
        nextTick(() => {
            textareaRef.value?.focus();
        });
    }
});

watch(() => props.initialCode, (newCode) => {
    shaderCode.value = newCode;
    onInput();
}, { immediate: true });

watch(() => props.initialParams, (newParams) => {
    params.value = {
        param1: 1.0,
        param2: 1.0,
        param3: 1.0,
        ...newParams
    };
}, { immediate: true });

onMounted(() => {
    onInput(); // Initial validation
});
</script>