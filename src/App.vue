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
import { computed, onMounted, onUnmounted } from 'vue'
import p5 from 'p5'
import { ref } from "vue"

const graphStore = useGraphStore()
const { output, executeAll, executeCurrent } = useExecution()
const p5Instance = ref<p5 | null>(null)

const sketch = (p: p5) => {
  p.setup = () => {
    const container = document.getElementById('p5-container')
    const width = container ? container.clientWidth : 400
    const height = container ? container.clientHeight : 300
    const canvas = p.createCanvas(width, height)
    canvas.parent('p5-container')
    p.background(50)
  }

  p.draw = () => {
    p.background(50)
    p.fill(255, 0, 0)
    p.ellipse(p.mouseX, p.mouseY, 50, 50)
  }

  p.windowResized = () => {
    const container = document.getElementById('p5-container')
    if (container) {
      p.resizeCanvas(container.clientWidth, container.clientHeight)
    }
  }
}


onMounted(() => {
  const container = document.getElementById('p5-container')
  let lastWidth = container?.clientWidth
  let lastHeight = container?.clientHeight

  const resizeObserver = new ResizeObserver(() => {
    if (p5Instance.value && container) {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width !== lastWidth || height !== lastHeight) {
        p5Instance.value.resizeCanvas(width, height)
        lastWidth = width
        lastHeight = height
      }
    }
  })
  if (container) resizeObserver.observe(container)

  // Clean up
  onUnmounted(() => {
    resizeObserver.disconnect()
  })
})


onMounted(() => {
  p5Instance.value = new p5(sketch)
})

onUnmounted(() => {
  if (p5Instance.value) {
    p5Instance.value.remove()
  }
})

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
          <div style="position: relative;">
            <SidebarTrigger
              class="m-2"
              style="position: absolute; top: 0; left: 0; z-index: 10;"
            />
          </div>
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
        <ResizablePanel :default-size="30">
          <div
            id="p5-container"
            class="w-full h-full bg-gray-900"
          ></div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel
          id="editor"
          :default-size="50"
        >
          <div class="h-full flex flex-col">
            <div class="controls">

              <!-- <Button
                variant="outline"
                size="sm"
                @click="executeCurrent"
              >
                Run Current (Ctrl+Shift+Enter)
              </Button> -->

              <Button
                variant="outline"
                size="sm"
                @click="executeAll"
              >
                Run
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.24182 2.32181C3.3919 2.23132 3.5784 2.22601 3.73338 2.30781L12.7334 7.05781C12.8974 7.14436 13 7.31457 13 7.5C13 7.68543 12.8974 7.85564 12.7334 7.94219L3.73338 12.6922C3.5784 12.774 3.3919 12.7687 3.24182 12.6782C3.09175 12.5877 3 12.4252 3 12.25V2.75C3 2.57476 3.09175 2.4123 3.24182 2.32181ZM4 3.57925V11.4207L11.4288 7.5L4 3.57925Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  ></path>
                </svg>
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
          :default-size="20"
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
  border-top: 1px solid #e0e0e0;
  justify-content: end;
}

#p5-container {
  width: 100%;
  height: 100%;
  background-color: #1e1e2e;
}
</style>
