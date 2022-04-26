<script setup>
import { webglStore } from '@/stores/webglStore'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  description: {
      type: String,
      required: true
  }
})

const store = webglStore();
</script>

<template>
<div class="start-game-screen">
    <h2>{{ props.name }}</h2>

    <p>{{ store }}</p>

    <button @click="() => { store.experience.world.changeScene('home') }">Home</button>
    <button @click="() => { store.experience.world.changeScene(props.name) }">Start</button>
</div>
</template>

<style scoped lang="scss">
.start-game-screen {
    background-color: #FAF7F1;
    padding: 20px;
    position: relative;
    top: 50vh;
    left: 50vw;
    width: 300px;
    transform: translate(calc(-50% - 400px), calc(-50% - 50px));
    padding: 30px 30px;
    border-radius: 50px;
    color: #84807E;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 25px;
    font-family: 'CG Heavy';
}
</style>