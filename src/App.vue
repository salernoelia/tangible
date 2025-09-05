<script
  setup
  lang="ts"
>
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./components/AppSidebar.vue";
import { useStorage } from '@vueuse/core';
import Editor from './components/Editor.vue';
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { computed, ref, watch } from 'vue';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import SidebarMenuItem from "./components/ui/sidebar/SidebarMenuItem.vue";
import Graph from "./components/Graph.vue";

import { useGraphStore } from '@/stores/GraphStore'


// const store = useCounterStore()
const graphStore = useGraphStore()

type Instance = {
  id: string,
  nodes: {
    id: string,
    content: string,
    lang: 'js' | 'wgsl' | 'glsl';
  }[]
}

const instance_content = useStorage<Instance>("instance", {
  id: "main",
  nodes: [
    {
      id: "node-1",
      content: "alert('hello world')",
      lang: 'js'
    }
  ]
})

const current_node_id = useStorage("current-editor-id", "node-1")

const currentEditorContent = computed({
  get() {
    const editor = instance_content.value.nodes.find(e => e.id === current_node_id.value);
    return editor ? editor.content : '';
  },
  set(val: string) {
    const editor = instance_content.value.nodes.find(e => e.id === current_node_id.value);
    if (editor) editor.content = val;
  }
});

const output = ref<string[]>([]);

function spawnNode() {
  const newId = `node-${Date.now()}`;
  instance_content.value.nodes.push({
    id: newId,
    content: "// New node",
    lang: 'js'
  });
  current_node_id.value = instance_content.value.nodes[instance_content.value.nodes.length - 1].id
}

function deleteNode() {
  const idx = instance_content.value.nodes.findIndex(e => e.id === current_node_id.value);
  if (idx !== -1) {
    instance_content.value.nodes.splice(idx, 1);
    if (instance_content.value.nodes.length > 0) {
      current_node_id.value = instance_content.value.nodes[0].id;
    } else {
      current_node_id.value = "";
    }
  }
  if (instance_content.value.nodes[0].id) {
    current_node_id.value = instance_content.value.nodes[0].id

  } else {
    spawnNode()
  }
}

// Sync graph store with instance content
watch(() => instance_content.value.nodes, (newNodes) => {
  graphStore.syncWithInstance(newNodes)
}, { deep: true, immediate: true })

// Watch for new nodes created by drag and drop
watch(() => graphStore.nodes.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // Find the new node
    const existingIds = instance_content.value.nodes.map(n => n.id)
    const newNode = graphStore.nodes.find(n => !existingIds.includes(n.id))

    if (newNode && newNode.data) {
      // Add to instance content
      instance_content.value.nodes.push({
        id: newNode.id,
        content: newNode.data.content || '// New node',
        lang: newNode.data.lang || 'js'
      })

      // Set as current editor
      current_node_id.value = newNode.id
    }
  }
})

function runAllNodes() {
  try {
    // Use execution order from graph store
    const executionOrder = graphStore.getExecutionOrder
    const orderedNodes = executionOrder
      .map(id => instance_content.value.nodes.find(n => n.id === id))
      .filter(Boolean)

    // Clear previous output

    for (const editor of orderedNodes) {
      let nodeOutput = '';
      const originalConsoleLog = console.log;
      console.log = (...args: any[]) => {
        nodeOutput += args.map(String).join(' ') + '\n';
      };

      let result;
      try {
        result = eval(editor.content);
      } catch (e) {
        nodeOutput += "Error: " + (e as Error).message + '\n';
      }

      // Restore original console.log
      console.log = originalConsoleLog;

      if (nodeOutput.trim()) {
        const lines = nodeOutput.trim().split('\n');
        output.value.push(...lines);
      }
      if (result !== undefined) {
        output.value.push(`Return value: ${String(result)}`);
      }
      console.log(output.value)
    }
  } catch (e) {
    output.value.push("Error: " + (e as Error).message)
  }
}


function runCurrentNode() {

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

        <SidebarProvider>
          <AppSidebar>
            <SidebarMenuItem
              v-for="e in instance_content.nodes"
              :key="e.id"
            >
              <a
                href="#"
                @click.prevent="current_node_id = e.id"
                class="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded"
              >
                <component is="span" />
                <span>{{ e.id }}</span>
              </a>
            </SidebarMenuItem>
          </AppSidebar>
          <main class="w-full">
            <SidebarTrigger class="mt-2 ml-2" />

            <Graph class="h-full w-full" />


          </main>
        </SidebarProvider>

      </ResizablePanel>
      <ResizableHandle
        id="main-handle-1"
        with-handle
      />
      <ResizablePanel
        id="main-panel-2"
        :default-size="35"
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
            <div class="controls flex flex-row justify-end">
              <Toggle
                variant="outline"
                aria-label="Toggle italic"
              >
                Canvas
              </Toggle>
              <Button
                variant="outline"
                @click="spawnNode"
              >New Node</Button>
              <Button
                variant="outline"
                @click="deleteNode"
              >Delete Node</Button>
              <Button
                variant="outline"
                @click="runAllNodes"
              >Run All</Button>
              <Button
                variant="outline"
                @click="runCurrentNode"
              >Run Current</Button>
            </div>

            <Editor
              :editor_id="current_node_id"
              v-model="currentEditorContent"
            />

          </ResizablePanel>
          <ResizableHandle
            id="nested-handle-1"
            with-handle
          />
          <ResizablePanel
            id="nested-panel-2"
            :default-size="20"
            class="h-screen p-2"
          >
            <h3 class="pb-1">Console</h3>
            <Separator />
            <div
              class="overflow-y-auto h-full"
              style="max-height: 100%;"
            >
              <div>
                <p
                  v-for="e in output"
                  :key="e"
                  class="whitespace-pre-wrap"
                >
                  > {{ e }}
                </p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<style scoped>
.nodes>* {
  margin-bottom: 10px;
}

.controls {
  padding: 0.5rem;
  gap: 10px;
  display: flex;
}
</style>
