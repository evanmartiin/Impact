<script setup>
import { webglStore } from '@/stores/webglStore'

const store = webglStore();
</script>

<template>
<div class="scoreboard">
    <h2>{{ store.experience.world.districts.scoreboard.score }}</h2>
</div>
</template>

<style scoped lang="scss">
.scoreboard {
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
}
</style>