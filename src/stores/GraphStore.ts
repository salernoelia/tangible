import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { Node, Edge } from '@vue-flow/core'
import { ref, computed } from 'vue'

export const useGraphStore = defineStore('graph', () => {
  // Persistent storage for nodes and edges
  const storedNodes = useStorage<Node[]>('graph-nodes', [])
  const storedEdges = useStorage<Edge[]>('graph-edges', [])
  
  const nodes = ref<Node[]>(storedNodes.value)
  const edges = ref<Edge[]>(storedEdges.value)

  // Sync with storage
  const syncToStorage = () => {
    storedNodes.value = nodes.value
    storedEdges.value = edges.value
  }

  // Node operations
  const addNode = (instanceNode: { id: string, content: string, lang: string }) => {
    const newNode: Node = {
      id: instanceNode.id,
      type: 'custom',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: instanceNode.id,
        content: instanceNode.content,
        lang: instanceNode.lang
      }
    }
    
    nodes.value.push(newNode)
    syncToStorage()
  }

  const updateNode = (id: string, updates: Partial<Node>) => {
    const index = nodes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      nodes.value[index] = { ...nodes.value[index], ...updates }
      syncToStorage()
    }
  }

  const removeNode = (id: string) => {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
    syncToStorage()
  }

  // Edge operations
  const addEdge = (edge: Edge) => {
    edges.value.push(edge)
    syncToStorage()
  }

  const removeEdge = (id: string) => {
    edges.value = edges.value.filter(e => e.id !== id)
    syncToStorage()
  }

  // Sync with instance nodes
  const syncWithInstance = (instanceNodes: Array<{ id: string, content: string, lang: string }>) => {
    // Add new nodes
    instanceNodes.forEach(instanceNode => {
      if (!nodes.value.find(n => n.id === instanceNode.id)) {
        addNode(instanceNode)
      } else {
        // Update existing node data
        updateNode(instanceNode.id, {
          data: {
            label: instanceNode.id,
            content: instanceNode.content,
            lang: instanceNode.lang
          }
        })
      }
    })

    // Remove deleted nodes
    const instanceIds = instanceNodes.map(n => n.id)
    nodes.value.forEach(node => {
      if (!instanceIds.includes(node.id)) {
        removeNode(node.id)
      }
    })
  }

  const getExecutionOrder = computed(() => {
    // Simple topological sort based on edges
    const visited = new Set<string>()
    const order: string[] = []
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      const dependents = edges.value
        .filter(e => e.target === nodeId)
        .map(e => e.source)
      
      dependents.forEach(visit)
      order.push(nodeId)
    }
    
    nodes.value.forEach(node => visit(node.id))
    return order
  })

  return {
    nodes,
    edges,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    syncWithInstance,
    getExecutionOrder
  }
})