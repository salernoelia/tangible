import { useGraphStore, type NodeData } from '@/stores/GraphStore'
import { p5Service } from '@/services/P5Service'
import { useTimeline } from '@/services/TimelineService'
import { ref } from 'vue'

export const useExecution = () => {
  const output = ref<string[]>([])
  const graphStore = useGraphStore()
  const timeline = useTimeline()

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
    let p5Code = ''
    
    orderedNodes.forEach((node, index) => {
      if (node.lang === 'p5') {
        p5Code += `\n${node.content}\n`
      } else {
        allCode += `\n${node.content}\n`
        if (index < orderedNodes.length - 1) {
          allCode += `console.log('[${node.id}] executed')\n`
        }
      }
    })
    
    console.log = (...args: any[]) => {
      output.value.push(args.map(String).join(' '))
    }

    try {
      if (allCode.trim()) {
        eval(allCode)
      }
      if (p5Code.trim()) {
        p5Service.executeCode(p5Code)
        timeline.play()
      }
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
        if (graphStore.currentNode.lang === 'p5') {
          p5Service.executeCode(graphStore.currentNode.content)
        } else {
          eval(graphStore.currentNode.content)
        }
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
