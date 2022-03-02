<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted } from "vue";
import { RouterLink, RouterView } from "vue-router";
onMounted(() => {
  new Experience(document.getElementById("webgl") as HTMLCanvasElement);
});
</script>

<template>
  <canvas id="webgl"></canvas>
  <nav id="nav">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/experience">Experience</RouterLink>
    <RouterLink to="/credits">Credits</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>
