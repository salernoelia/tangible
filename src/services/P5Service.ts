import p5 from 'p5'

export class P5Service {
  private instance: p5 | null = null
  private container: HTMLElement | null = null
  private userSetup: ((p: p5) => void) | null = null
  private userDraw: ((p: p5) => void) | null = null
  private userCode: string = ''
  private isRunning: boolean = false
  private continuousNodes: Set<string> = new Set()

  init(containerId: string) {
    this.container = document.getElementById(containerId)
    if (!this.container) return

    this.instance = new p5(this.sketch.bind(this))
  }

  destroy() {
    this.stop()
    if (this.instance) {
      this.instance.remove()
      this.instance = null
    }
  }

  start() {
    this.isRunning = true
  }

  stop() {
    this.isRunning = false
    this.userSetup = null
    this.userDraw = null
  }

  executeCode(code: string, nodeId?: string) {
    this.userCode = code
    if (nodeId) {
      this.continuousNodes.add(nodeId)
    }
    try {
      const func = new Function('p', 'setup', 'draw', 'background', 'fill', 'stroke', 'ellipse', 'rect', 'line', 'point', 'createVector', 'noise', 'random', 'map', 'sin', 'cos', 'PI', 'TWO_PI', 'width', 'height', 'mouseX', 'mouseY', 'frameCount', 'millis', 'second', 'minute', 'hour', code)
      if (this.instance) {
        func.call(
          this,
          this.instance,
          (fn: (p: p5) => void) => { this.userSetup = fn },
          (fn: (p: p5) => void) => { this.userDraw = fn },
          this.instance.background.bind(this.instance),
          this.instance.fill.bind(this.instance),
          this.instance.stroke.bind(this.instance),
          this.instance.ellipse.bind(this.instance),
          this.instance.rect.bind(this.instance),
          this.instance.line.bind(this.instance),
          this.instance.point.bind(this.instance),
          this.instance.createVector.bind(this.instance),
          this.instance.noise.bind(this.instance),
          this.instance.random.bind(this.instance),
          this.instance.map.bind(this.instance),
          this.instance.sin.bind(this.instance),
          this.instance.cos.bind(this.instance),
          this.instance.PI,
          this.instance.TWO_PI,
          this.instance.width,
          this.instance.height,
          this.instance.mouseX,
          this.instance.mouseY,
          this.instance.frameCount,
          this.instance.millis.bind(this.instance),
          this.instance.second.bind(this.instance),
          this.instance.minute.bind(this.instance),
          this.instance.hour.bind(this.instance)
        )
      }
    } catch (error) {
      console.error('P5 execution error:', error)
    }
  }

  private sketch(p: p5) {
    p.setup = () => {
      if (!this.container) return
      const width = this.container.clientWidth
      const height = this.container.clientHeight
      const canvas = p.createCanvas(width, height)
      canvas.parent(this.container)
      p.background(20)
      
      if (this.userSetup) {
        this.userSetup(p)
      }
    }

    p.draw = () => {
      if (this.isRunning && this.userDraw) {
        this.userDraw(p)
      }
    }

    p.windowResized = () => {
      if (this.container) {
        p.resizeCanvas(this.container.clientWidth, this.container.clientHeight)
      }
    }
  }

  get p5Instance() {
    return this.instance
  }

  get running() {
    return this.isRunning
  }
}

export const p5Service = new P5Service()
