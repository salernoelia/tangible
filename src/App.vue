<script
  setup
  lang="ts"
>
import { useStorage } from '@vueuse/core';
import Editor from './components/Editor.vue';
import { Button } from '@/components/ui/button'
import { ref } from 'vue';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

type Instance = {
  id: string,
  editors: {
    id: string,
    content: string,
  }[]
}

const instance_content = useStorage<Instance>("instance", {
  id: "main",
  editors: [
    {
      id: "editor-1",
      content: "function hello() { console.log('world'); return 50; }"
    }
  ]
})

const output = ref<string>("");

function spawnEditor() {
  const newId = `editor-${Date.now()}`;
  instance_content.value.editors.push({
    id: newId,
    content: "// New editor"
  });
}

function run() {
  try {
    const code = instance_content.value.editors
      .map(editor => editor.content)
      .join('\n');

    const result = eval(code);
    output.value = String(result || 'Executed');
  } catch (e) {
    output.value = "Error: " + (e as Error).message;
  }
}
</script>

<template>
  <div>
    <ResizablePanelGroup
      direction="horizontal"
      class="h-screen w-screen"
    >
      <ResizablePanel class="h-screen">

      </ResizablePanel>
      <ResizableHandle with-handle />
      <ResizablePanel class="h-screen">
        <div class="flex flex-row">
          <Button @click="spawnEditor">Add Editor</Button>
          <Button @click="run">Run All</Button>
        </div>

        <div class="editors">
          <Editor
            v-for="editor in instance_content.editors"
            :key="editor.id"
            :editor_id="editor.id"
            v-model="editor.content"
          />
        </div>
        <div>
          <strong>Output:</strong>
          <pre>{{ output }}</pre>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>




  </div>
</template>

<style scoped>
.editors>* {
  margin-bottom: 10px;
}

.controls {
  margin: 10px 0;
  gap: 10px;
  display: flex;
}
</style>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
