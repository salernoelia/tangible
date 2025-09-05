import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'
import { useGraphStore } from '@/stores/GraphStore'

const state = {
  draggedType: ref<'js' | 'glsl' | 'wgsl' | 'p5' | null>(null),
  isDragOver: ref(false),
  isDragging: ref(false),
}

export default function useDragAndDrop() {
  const { draggedType, isDragOver, isDragging } = state
  const { screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()
  const graphStore = useGraphStore()

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event: DragEvent, type: 'js' | 'glsl' | 'wgsl' | 'p5') {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', type)
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedType.value = type
    isDragging.value = true
    document.addEventListener('drop', onDragEnd)
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()
    if (draggedType.value) {
      isDragOver.value = true
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDragEnd() {
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = null
    document.removeEventListener('drop', onDragEnd)
  }

  function onDrop(event: DragEvent) {
    if (!draggedType.value) return
    
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode = graphStore.createNode(draggedType.value, position)

    const { off } = onNodesInitialized(() => {
      updateNode(newNode.id, (node) => ({
        position: { 
          x: node.position.x - node.dimensions.width / 2, 
          y: node.position.y - node.dimensions.height / 2 
        },
      }))
      off()
    })
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
  }
}
