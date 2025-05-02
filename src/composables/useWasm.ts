import { ref, onMounted } from 'vue';

interface WasmModule {
  greet: (name: string) => void;
  add: (one: number, two: number) => number;
}

export function useWasm() {
  const wasmModule = ref<WasmModule | null>(null);
  const isLoaded = ref(false);
  const isLoading = ref(false);
  const loadError = ref<Error | null>(null);

  async function loadWasm() {
    if (isLoaded.value || isLoading.value) return;
    
    isLoading.value = true;
    
    try {
      const wasm = await import("../../backend/pkg/backend.js");
      await wasm.default();
      wasmModule.value = wasm as unknown as WasmModule;
      isLoaded.value = true;
    } catch (err) {
      loadError.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      isLoading.value = false;
    }
  }

  function callWasm<T extends keyof WasmModule>(
    functionName: T,
    ...args: Parameters<WasmModule[T]>
  ): ReturnType<WasmModule[T]> | undefined {
    if (!wasmModule.value) return undefined;
    
    try {
      return wasmModule.value[functionName](...args) as ReturnType<WasmModule[T]>;
    } catch (err) {
      return undefined;
    }
  }

  onMounted(() => {
    loadWasm();
  });

  return {
    wasmModule,
    isLoaded,
    isLoading,
    loadError,
    callWasm
  };
}