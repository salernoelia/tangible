<template>
  <div class="min-h-screen flex flex-row">
    <Canvas ref="canvasRef" />
    <NodePicker v-if="nodePickerActive" />
    <ShaderEditor
      :isVisible="shaderEditorActive"
      :initialCode="shaderCode"
      :initialParams="shaderParams"
      @close="closeShaderEditor"
      @apply="saveShader"
    />
    <FullscreenOutput
      :isVisible="fullscreenActive"
      :outputTexture="outputTexture"
      @close="closeFullscreen"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Canvas from './components/Canvas.vue'
import NodePicker from './components/NodePicker.vue'
import ShaderEditor from './components/ShaderEditor.vue'
import FullscreenOutput from './components/FullscreenOutput.vue'
import type { Node } from './canvas/Node';
import type { MediaResource } from './utils/MediaManager';

const canvasRef = ref();
const nodePickerActive = ref(false);
const shaderEditorActive = ref(false);
const fullscreenActive = ref(false);
const shaderNode = ref<Node | null>(null);
const shaderCode = ref('');
const shaderParams = ref<Record<string, number>>({});
const outputTexture = ref<MediaResource | null>(null);

const defaultShaderCode = `
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_param1;
uniform float u_param2;
uniform float u_param3;

varying vec2 vTexCoord;

void main() {
    vec2 uv = vTexCoord;
    vec4 color = texture2D(u_texture, uv);
    
    // Simple effect: adjust brightness
    color.rgb *= u_param1;
    
    gl_FragColor = color;
}
`;

const toggleNodePicker = () => {
  nodePickerActive.value = !nodePickerActive.value;
};

const toggleFullscreen = () => {
  if (fullscreenActive.value) {
    fullscreenActive.value = false;
  } else {
    // Get the output texture from Canvas component
    if (canvasRef.value && canvasRef.value.getOutputTexture) {
      outputTexture.value = canvasRef.value.getOutputTexture();
      fullscreenActive.value = true;
    }
  }
};

const closeFullscreen = () => {
  fullscreenActive.value = false;
};

const openShaderEditor = (event: CustomEvent) => {
  shaderNode.value = event.detail.node;
  shaderCode.value = event.detail.node.data.fragmentShader || defaultShaderCode;
  shaderParams.value = event.detail.node.data.params || { param1: 1.0, param2: 1.0, param3: 1.0 };
  shaderEditorActive.value = true;
};

const closeShaderEditor = () => {
  shaderEditorActive.value = false;
  shaderNode.value = null;
};

const saveShader = (code: string, params: Record<string, number>) => {
  if (shaderNode.value) {
    shaderNode.value.data.fragmentShader = code;
    shaderNode.value.data.params = params;
    shaderNode.value.updateOutput();
  }
  closeShaderEditor();
};

onMounted(() => {
  document.addEventListener('toggle-node-picker', toggleNodePicker);
  document.addEventListener('toggle-fullscreen-output', toggleFullscreen);
  document.addEventListener('open-shader-editor', openShaderEditor as EventListener);
});

onUnmounted(() => {
  document.removeEventListener('toggle-node-picker', toggleNodePicker);
  document.removeEventListener('toggle-fullscreen-output', toggleFullscreen);
  document.removeEventListener('open-shader-editor', openShaderEditor as EventListener);
});
</script>