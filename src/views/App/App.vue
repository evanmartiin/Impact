<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import StartGameScreen from '@/components/StartGameScreen.vue'
import Scoreboard from '@/components/Scoreboard.vue'
import signal from 'signal-js';

const selectedDistrict = ref('');
const showScoreboard = ref(false);
const score = ref(0);
const experienceStarted = ref(false);

const start = () => {
  experienceStarted.value = true;
  signal.emit("start_experience");
}

onMounted(() => {
  const experience = new Experience(document.getElementById("webgl") as HTMLCanvasElement);
  const store = webglStore();
  store.$state = { experience };
  
  signal.on("loaders_ready", () => {
    signal.on("district_selected", (district: any) => {
      selectedDistrict.value = district.name;
    })
    signal.on("no_district_selected", () => {
      selectedDistrict.value = "";
    })
  })
});
</script>

<template>
  <main>
    <canvas id="webgl"></canvas>
    <div id="home" v-if="!experienceStarted">
      <h1>Home</h1>
      <button @click="start">Start</button>
    </div>
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>
