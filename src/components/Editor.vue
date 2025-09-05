<script
  setup
  lang="ts"
>
import { onMounted, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

const props = defineProps<{
  modelValue: string
  language?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const container = ref<HTMLDivElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

self.MonacoEnvironment = {
  getWorker: function (_, label) {
    switch (label) {
      case 'typescript':
      case 'javascript':
        return new tsWorker()
      default:
        return new editorWorker()
    }
  }
}

onMounted(() => {
  if (!container.value) return

  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language || 'javascript',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    theme: 'vs'
  })

  editor.onDidChangeModelContent(() => {
    const value = editor!.getValue()
    emit('update:modelValue', value)
  })
})

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.language, (newLang) => {
  if (editor && newLang) {
    monaco.editor.setModelLanguage(editor.getModel()!, newLang)
  }
})
</script>

<template>
  <div
    ref="container"
    class="editor-container"
  ></div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
</style>
