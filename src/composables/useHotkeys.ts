import { onMounted, onUnmounted } from 'vue'

export default function useHotkeys(bindings: Record<string, () => void>) {
  const handleKeydown = (event: KeyboardEvent) => {
    const key = [
      event.ctrlKey && 'ctrl',
      event.metaKey && 'cmd',
      event.shiftKey && 'shift',
      event.altKey && 'alt',
      event.key.toLowerCase()
    ].filter(Boolean).join('+')

    const handler = bindings[key]
    if (handler) {
      event.preventDefault()
      handler()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
