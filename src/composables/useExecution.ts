import { useGraphStore, type NodeData } from '@/stores/GraphStore'
import { ref } from 'vue'

export const useExecution = () => {
  const output = ref<string[]>([])
  const graphStore = useGraphStore()

  const executeAll = () => {
    output.value = []
    
    const orderedNodes = graphStore.executionOrder
      .map(id => graphStore.nodeData.find(n => n.id === id))
      .filter(Boolean) as NodeData[]
    
    if (orderedNodes.length === 0) {
      output.value.push('No nodes on canvas')
      return
    }
    
    output.value.push(`Executing ${orderedNodes.length} nodes: ${orderedNodes.map(n => n.id).join(' -> ')}`)
    
    const originalConsoleLog = console.log
    let allCode = ''
    
    orderedNodes.forEach((node, index) => {
      allCode += `\n${node.content}\n`
      if (index < orderedNodes.length - 1) {
        allCode += `console.log('[${node.id}] executed')\n`
      }
    })
    
    console.log = (...args: any[]) => {
      output.value.push(args.map(String).join(' '))
    }

    try {
      eval(allCode)
    } catch (e) {
      const error = e as Error
      output.value.push(`ERROR: ${error.message}`)
    } finally {
      console.log = originalConsoleLog
    }
  }

  const executeCurrent = () => {
    if (graphStore.currentNode) {
      output.value = []
      output.value.push(`Testing: ${graphStore.currentNode.id}`)
      
      const originalConsoleLog = console.log
      console.log = (...args: any[]) => {
        output.value.push(args.map(String).join(' '))
      }

      try {
        eval(graphStore.currentNode.content)
      } catch (e) {
        const error = e as Error
        output.value.push(`ERROR: ${error.message}`)
      } finally {
        console.log = originalConsoleLog
      }
    }
  }

  return {
    output,
    executeAll,
    executeCurrent
  }
}
