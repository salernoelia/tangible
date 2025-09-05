import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { Node, Edge } from '@vue-flow/core'
import { computed } from 'vue'

export type NodeData = {
  id: string
  content: string
  lang: 'js' | 'glsl' | 'wgsl'
}

export const useGraphStore = defineStore('graph', () => {
  const nodeData = useStorage<NodeData[]>('nodes', [{ 
    id: 'node-1', 
    content: "const message = 'Hello from Node 1'\nconsole.log(message)", 
    lang: 'js' 
  }])
  
  const flowNodes = useStorage<Node[]>('flow-nodes', [])
  const flowEdges = useStorage<Edge[]>('flow-edges', [])
  const currentNodeId = useStorage('current-node-id', 'node-1')

  const currentNode = computed(() => 
    nodeData.value.find(n => n.id === currentNodeId.value)
  )

  const canvasNodes = computed(() => {
    const canvasNodeIds = new Set(flowNodes.value.map(n => n.id))
    return nodeData.value.filter(n => canvasNodeIds.has(n.id))
  })

  const executionOrder = computed(() => {
    const canvasNodeIds = new Set(flowNodes.value.map(n => n.id))
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []
    
    const visit = (nodeId: string): boolean => {
      if (!canvasNodeIds.has(nodeId)) return true
      if (visiting.has(nodeId)) return false
      if (visited.has(nodeId)) return true
      
      visiting.add(nodeId)
      
      const dependencies = flowEdges.value
        .filter(e => e.target === nodeId && canvasNodeIds.has(e.source))
        .map(e => e.source)
      
      for (const dep of dependencies) {
        if (!visit(dep)) return false
      }
      
      visiting.delete(nodeId)
      visited.add(nodeId)
      order.push(nodeId)
      return true
    }
    
    const rootNodes = flowNodes.value.filter(node => 
      !flowEdges.value.some(edge => edge.target === node.id)
    )
    
    for (const node of rootNodes) {
      if (!visit(node.id)) {
        return []
      }
    }
    
    for (const node of flowNodes.value) {
      if (!visited.has(node.id)) {
        if (!visit(node.id)) {
          return []
        }
      }
    }
    
    return order
  })

  const createNode = (lang: 'js' | 'glsl' | 'wgsl' = 'js', position?: { x: number, y: number }) => {
    const templates = {
      js: "const a = 42\nconsole.log('Value:', a)",
      glsl: "vec3 color = vec3(1.0, 0.0, 0.0);\ngl_FragColor = vec4(color, 1.0);",
      wgsl: "@fragment\nfn main() -> @location(0) vec4<f32> {\n  return vec4<f32>(1.0, 0.0, 0.0, 1.0);\n}"
    }
    
    const id = `node-${Date.now()}`
    const newNode: NodeData = {
      id,
      content: templates[lang],
      lang
    }
    
    nodeData.value.push(newNode)
    
    if (position) {
      const flowNode: Node = {
        id,
        type: 'custom',
        position,
        data: { label: id, content: newNode.content, lang }
      }
      flowNodes.value.push(flowNode)
    }
    
    currentNodeId.value = id
    return newNode
  }

  const deleteNode = (id: string) => {
    nodeData.value = nodeData.value.filter(n => n.id !== id)
    flowNodes.value = flowNodes.value.filter(n => n.id !== id)
    flowEdges.value = flowEdges.value.filter(e => e.source !== id && e.target !== id)
    
    if (currentNodeId.value === id && nodeData.value.length > 0) {
      currentNodeId.value = nodeData.value[0].id
    }
  }

  const updateNodeContent = (id: string, content: string) => {
    const node = nodeData.value.find(n => n.id === id)
    if (node) {
      node.content = content
      const flowNode = flowNodes.value.find(n => n.id === id)
      if (flowNode) {
        flowNode.data = { ...flowNode.data, content }
      }
    }
  }

  const updateNodePosition = (id: string, position: { x: number, y: number }) => {
    const flowNode = flowNodes.value.find(n => n.id === id)
    if (flowNode) {
      flowNode.position = position
    }
  }

  const addEdge = (edge: Edge) => {
    flowEdges.value.push(edge)
  }

  const selectNode = (id: string) => {
    currentNodeId.value = id
  }

  return {
    nodeData,
    flowNodes,
    flowEdges,
    currentNodeId,
    currentNode,
    canvasNodes,
    executionOrder,
    createNode,
    deleteNode,
    updateNodeContent,
    updateNodePosition,
    addEdge,
    selectNode
  }
})