<script setup>

import signal from 'signal-js';
import { onMounted, ref } from 'vue';

const props = defineProps({});

const number = ref('3');

onMounted(() => {
  signal.on("set_counter_number", (e) => number.value = e);
});

</script>

<template>
  <p id="counter">
    {{number}}
  </p>
</template>

<style scoped lang="scss">

#counter {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3D(-50%, -50%, 0);
  color: white;
  font-size: 80px;
  -webkit-text-stroke-width: 3px;
  -webkit-text-stroke-color: #0D1C51;
  display: none;
}
</style>