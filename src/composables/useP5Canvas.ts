import { p5Service } from '@/services/P5Service'

export const useP5Canvas = () => {
  const initCanvas = (containerId: string) => {
    p5Service.init(containerId)
  }

  const destroyCanvas = () => {
    p5Service.destroy()
  }

  const executeP5Code = (code: string) => {
    p5Service.executeCode(code)
  }

  const getP5Instance = () => {
    return p5Service.p5Instance
  }

  return {
    initCanvas,
    destroyCanvas,
    executeP5Code,
    getP5Instance
  }
}
