import { ref, computed } from 'vue'
import { useGraphStore } from '@/stores/GraphStore'
import { p5Service } from '@/services/P5Service'

export class TimelineService {
  private animationFrame: number | null = null
  private _isPlaying = ref(false)
  private _currentTime = ref(0)
  private _duration = ref(10000)
  private _playbackSpeed = ref(1)
  private lastTimestamp = 0
  private executionCallbacks: Map<string, () => void> = new Map()
  private graphStore: ReturnType<typeof useGraphStore>

  constructor(graphStore: ReturnType<typeof useGraphStore>) {
    this.graphStore = graphStore
  }

  get isPlaying() {
    return this._isPlaying.value
  }

  get currentTime() {
    return this._currentTime.value
  }

  get duration() {
    return this._duration.value
  }

  get playbackSpeed() {
    return this._playbackSpeed.value
  }

  get progress() {
    return computed(() => this._currentTime.value / this._duration.value)
  }

  play() {
    if (this._isPlaying.value) return
    
    this._isPlaying.value = true
    p5Service.start()
    this.lastTimestamp = performance.now()
    this.tick()
  }

  pause() {
    this._isPlaying.value = false
    p5Service.stop()
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  stop() {
    this.pause()
    this._currentTime.value = 0
  }

  seek(time: number) {
    this._currentTime.value = Math.max(0, Math.min(time, this._duration.value))
    this.executeAtCurrentTime()
  }

  setDuration(duration: number) {
    this._duration.value = Math.max(1000, duration)
  }

  setPlaybackSpeed(speed: number) {
    this._playbackSpeed.value = Math.max(0.1, Math.min(speed, 4))
  }

  private tick() {
    if (!this._isPlaying.value) return

    const now = performance.now()
    const deltaTime = (now - this.lastTimestamp) * this._playbackSpeed.value
    this.lastTimestamp = now

    this._currentTime.value += deltaTime
    
    if (this._currentTime.value >= this._duration.value) {
      this._currentTime.value = 0
    }

    this.executeAtCurrentTime()
    this.animationFrame = requestAnimationFrame(() => this.tick())
  }

  private executeAtCurrentTime() {
    const orderedNodes = this.graphStore.executionOrder
      .map(id => this.graphStore.nodeData.find(n => n.id === id))
      .filter((node): node is NonNullable<typeof node> => Boolean(node))

    const p5Nodes = orderedNodes.filter(node => node.lang === 'p5')
    
    if (p5Nodes.length > 0) {
      const combinedCode = p5Nodes.map(node => node.content).join('\n')
      const timeInjectedCode = `
        const time = ${this._currentTime.value / 1000};
        const frame = ${Math.floor(this._currentTime.value / 16.67)};
        ${combinedCode}
      `
      p5Service.executeCode(timeInjectedCode)
    }

    const jsNodes = orderedNodes.filter(node => node.lang === 'js')
    if (jsNodes.length > 0) {
      jsNodes.forEach(node => {
        const callback = this.executionCallbacks.get(node.id)
        if (callback) callback()
      })
    }
  }

  registerExecutionCallback(nodeId: string, callback: () => void) {
    this.executionCallbacks.set(nodeId, callback)
  }

  unregisterExecutionCallback(nodeId: string) {
    this.executionCallbacks.delete(nodeId)
  }
}

let timelineInstance: TimelineService | null = null

export const useTimeline = () => {
  const graphStore = useGraphStore()
  
  if (!timelineInstance) {
    timelineInstance = new TimelineService(graphStore)
  }
  
  return timelineInstance
}
