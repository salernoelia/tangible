<script
  setup
  lang="ts"
>
import { useStorage } from '@vueuse/core';
import Editor from './components/Editor.vue';
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue';
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

const current_editor_id = ref("editor-1")

const currentEditorContent = computed({
  get() {
    const editor = instance_content.value.editors.find(e => e.id === current_editor_id.value);
    return editor ? editor.content : '';
  },
  set(val: string) {
    const editor = instance_content.value.editors.find(e => e.id === current_editor_id.value);
    if (editor) editor.content = val;
  }
});

const output = ref<string>("");

function spawnEditor() {
  const newId = `editor-${Date.now()}`;
  instance_content.value.editors.push({
    id: newId,
    content: "// New editor"
  });
  current_editor_id.value = instance_content.value.editors[instance_content.value.editors.length - 1].id
}

function deleteEditor() {
  const idx = instance_content.value.editors.findIndex(e => e.id === current_editor_id.value);
  if (idx !== -1) {
    instance_content.value.editors.splice(idx, 1);
    if (instance_content.value.editors.length > 0) {
      current_editor_id.value = instance_content.value.editors[0].id;
    } else {
      current_editor_id.value = "";
    }
  }
  if (instance_content.value.editors[0].id) {
    current_editor_id.value = instance_content.value.editors[0].id

  } else {
    spawnEditor()
  }
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
      id="main-group"
      direction="horizontal"
      class="h-screen rounded-lg border"
    >
      <ResizablePanel
        id="main-panel-1"
        :default-size="50"
        class="h-screen flex flex-col"
      >
        <h1>Availible editors</h1>
        <Button
          v-for="e in instance_content.editors"
          :key="e.id"
          @click="current_editor_id = e.id"
        >
          id: {{ e.id }}
        </Button>

      </ResizablePanel>
      <ResizableHandle
        id="main-handle-1"
        with-handle
      />
      <ResizablePanel
        id="main-panel-2"
        :default-size="50"
        class="h-screen"
      >
        <ResizablePanelGroup
          id="nested-group"
          direction="vertical"
          class="h-screen"
        >
          <ResizablePanel
            id="nested-panel-1"
            :default-size="60"
            class="h-screen"
          >
            <div class="controls flex flex-row">
              <Button @click="spawnEditor">Add Editor</Button>
              <Button @click="deleteEditor">Delete Editor</Button>
              <Button @click="run">Run All</Button>
            </div>

            <Editor
              :editor_id="current_editor_id"
              v-model="currentEditorContent"
            />

          </ResizablePanel>
          <ResizableHandle
            id="nested-handle-1"
            with-handle
          />
          <ResizablePanel
            id="nested-panel-2"
            :default-size="40"
            class="h-screen"
          >
            <strong>Output:</strong>
            <pre>{{ output }}</pre>
          </ResizablePanel>
        </ResizablePanelGroup>
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
