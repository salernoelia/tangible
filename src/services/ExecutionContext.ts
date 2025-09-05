export class ExecutionContext {
  private variables: Map<string, any> = new Map()
  private shaders: Map<string, string> = new Map()
  private functions: Map<string, Function> = new Map()

  setVariable(name: string, value: any) {
    this.variables.set(name, value)
  }

  getVariable(name: string) {
    return this.variables.get(name)
  }

  setShader(name: string, source: string) {
    this.shaders.set(name, source)
  }

  getShader(name: string) {
    return this.shaders.get(name)
  }

  setFunction(name: string, func: Function) {
    this.functions.set(name, func)
  }

  getFunction(name: string) {
    return this.functions.get(name)
  }

  clear() {
    this.variables.clear()
    this.shaders.clear()
    this.functions.clear()
  }

  getGlobalScope() {
    const scope: Record<string, any> = {}
    
    this.variables.forEach((value, key) => {
      scope[key] = value
    })
    
    this.shaders.forEach((source, key) => {
      scope[key] = source
    })
    
    this.functions.forEach((func, key) => {
      scope[key] = func
    })
    
    return scope
  }

  getAllVariables() {
    return Array.from(this.variables.entries())
  }

  getAllShaders() {
    return Array.from(this.shaders.entries())
  }
}

export const globalExecutionContext = new ExecutionContext()
