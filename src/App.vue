<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useWasm } from './composables/useWasm'
import { watch } from 'vue';

const { isLoaded, callWasm } = useWasm();

watch(isLoaded, (loaded) => {
  if (loaded) {
    callWasm('greet', 'World');

    const result = callWasm('add', 99, 2)
    console.log(result)
  }
});
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>