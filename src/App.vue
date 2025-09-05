<script
  setup
  lang="ts"
>
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "./components/AppSidebar.vue"
import Editor from './components/Editor.vue'
import Graph from "./components/Graph.vue"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useGraphStore } from '@/stores/GraphStore'
import { useExecution } from '@/composables/useExecution'
import useHotkeys from '@/composables/useHotkeys'
import { computed } from 'vue'

const graphStore = useGraphStore()
const { output, executeAll, executeCurrent } = useExecution()

const currentEditorContent = computed({
  get: () => graphStore.currentNode?.content || '',
  set: (value: string) => {
    if (graphStore.currentNodeId) {
      graphStore.updateNodeContent(graphStore.currentNodeId, value)
    }
  }
})

const editorLanguage = computed(() => {
  const lang = graphStore.currentNode?.lang
  if (lang === 'glsl' || lang === 'wgsl') return 'glsl'
  return 'javascript'
})

useHotkeys({
  'ctrl+n': () => graphStore.createNode(),
  'cmd+n': () => graphStore.createNode(),
  'ctrl+enter': executeAll,
  'cmd+enter': executeAll,
  'ctrl+shift+enter': executeCurrent,
  'cmd+shift+enter': executeCurrent,
  'delete': () => {
    if (graphStore.currentNodeId && graphStore.nodeData.length > 1) {
      graphStore.deleteNode(graphStore.currentNodeId)
    }
  }
})
</script>

<template>
  <ResizablePanelGroup
    id="main"
    direction="horizontal"
    class="h-screen"
  >
    <ResizablePanel
      id="sidebar-graph"
      :default-size="60"
      class="flex flex-col"
    >
      <SidebarProvider>
        <AppSidebar />
        <main class="flex-1">
          <SidebarTrigger class="m-2" />
          <Graph class="h-full w-full" />
        </main>
      </SidebarProvider>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel
      id="editor-console"
      :default-size="40"
    >
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel
          id="editor"
          :default-size="70"
        >
          <div class="h-full flex flex-col">
            <div class="controls">
              <Button
                variant="outline"
                size="sm"
                @click="executeAll"
              >
                Run All (Ctrl+Enter)
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="executeCurrent"
              >
                Run Current (Ctrl+Shift+Enter)
              </Button>
            </div>
            <Editor
              v-model="currentEditorContent"
              :language="editorLanguage"
              class="flex-1"
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel
          id="console"
          :default-size="30"
          class="p-3"
        >
          <h3 class="text-sm font-semibold mb-2">Console</h3>
          <Separator class="mb-2" />
          <div class="text-sm font-mono space-y-1 overflow-y-auto h-full">
            <div
              v-for="line in output"
              :key="line"
              class="text-gray-700"
            >
              > {{ line }}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}
</style>
