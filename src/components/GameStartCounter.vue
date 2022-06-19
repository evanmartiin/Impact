<script setup lang="ts">

import { useSeedGame } from '@/stores/SeedGame.store';

const seedGameStore = useSeedGame()

</script>

<template>
  <p id="counter">
    {{seedGameStore.startingBlock}}
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