<template>
  <div class="min-h-screen flex flex-row">
    <Canvas />
    <NodePicker v-if="nodePickerActive" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Canvas from './components/Canvas.vue'
import NodePicker from './components/NodePicker.vue'

const nodePickerActive = ref(false);

const toggleNodePicker = () => {
  nodePickerActive.value = !nodePickerActive.value;
};

onMounted(() => {
  document.addEventListener('toggle-node-picker', toggleNodePicker);
});

onUnmounted(() => {
  document.removeEventListener('toggle-node-picker', toggleNodePicker);
});
</script>