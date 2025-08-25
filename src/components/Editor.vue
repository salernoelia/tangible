<script
  setup
  lang="ts"
>
import { onMounted, ref, watch } from 'vue';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// import '@bithero/monaco-glsl';


const props = defineProps<{
  editor_id: string;
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const container = ref<HTMLDivElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

self.MonacoEnvironment = {
  getWorker: function (_, label) {
    switch (label) {
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
};

onMounted(() => {
  if (!container.value) return;

  // Add intellisense for all nodes
  const allCode = props.modelValue;
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    allCode,
    `file:///${props.editor_id}.js`
  );

  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: false }
  });

  editor.onDidChangeModelContent(() => {
    const value = editor!.getValue();
    emit('update:modelValue', value);

    // Update intellisense
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      value,
      `file:///${props.editor_id}.js`
    );
  });
});

// Watch for changes in modelValue to update editor content when switching nodes
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue);
  }
});
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
  border: 1px solid #ccc;
}
</style>
