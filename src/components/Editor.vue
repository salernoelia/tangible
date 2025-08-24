<script
  setup
  lang="ts"
>
import { onMounted } from 'vue';
import { useStorage } from '@vueuse/core'
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const props = defineProps<{ editor_id: string }>()


self.MonacoEnvironment = {
  getWorker: function (_, label) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new cssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new htmlWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
};

const editor_content = useStorage(
  props.editor_id,
  `function main() {\n\talert('Hello world!');\n}`,
  localStorage
)


onMounted(() => {
  const container = document.getElementById('container')
  if (!container) return

  const utils_code = "function hellow() { console.log('world'); return 50;}"
  monaco.languages.typescript.javascriptDefaults.addExtraLib(utils_code);

  const editor = monaco.editor.create(container, {
    value: editor_content.value,
    language: 'javascript',
    automaticLayout: true
  })

  editor.onDidChangeModelContent(() => {
    editor_content.value = editor.getValue()
  })
})
</script>

<template>
  <div id="container"></div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 400px;
}
</style>
