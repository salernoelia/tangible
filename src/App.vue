<script
  setup
  lang="ts"
>

import { useStorage } from '@vueuse/core';
import Editor from './components/Editor.vue';
import { Button } from '@/components/ui/button'
import { ref } from 'vue';

// const instance = {
//   id: "38c2a142-7eef-4b1a-bdf7-23d3d2b5e8bc",
//   editors: ["386aef5f-a183-49b3-a829-0c855142d752", "eb9b6a81-4ebb-4920-a3f8-4d36614a40d7"]
// }

const editor_id_1 = "386aef5f-a183-49b3-a829-0c855142d752"

// const instance_content = useStorage <

const editor_content = useStorage<string | null>(editor_id_1, null)

const output = ref<string>("");

function run() {
  if (!editor_content.value) {
    output.value = "No code";
    return;
  }
  try {
    console.log(editor_content.value)
    const result = eval(editor_content.value + "; main();");
    output.value = String(result);
  } catch (e) {
    output.value = "Error: " + (e as Error).message;
  }
}

</script>

<template>
  <div>
    <Editor :editor_id_1="editor_id_1" />
    <Editor :editor_id_1="editor_id_2" />
    <Button @click="run">Run</Button>

    <div>
      <strong>Output:</strong>
      <pre>{{ output }}</pre>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
