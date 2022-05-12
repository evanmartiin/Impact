<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import StartGameScreen from '@/components/StartGameScreen.vue'
import Scoreboard from '@/components/Scoreboard.vue'

const selectedDistrict = ref('');
const showScoreboard = ref(false);
const score = ref(0);

onMounted(() => {
  const experience = new Experience(document.getElementById("webgl") as HTMLCanvasElement);
  const store = webglStore();
  store.$state = { experience };
  
  if (store.experience.loaders) {
    store.experience.loaders.on('ready', () => {
      if (store.experience.world?.earth) {
        store.experience.world.earth.on('district_selected', (district: any) => {
          selectedDistrict.value = district.name;
        })
        store.experience.world.earth.on('no_district_selected', () => {
          selectedDistrict.value = '';
        })
      }
  
      // store.experience.world.districts.scoreboard.on("timer_started", () => {
      //   showScoreboard.value = true;
  
      //   store.experience.world.districts.scoreboard.on("timer_ended", () => {
      //     showScoreboard.value = false;
      //     store.experience.world.districts.scoreboard.off("timer_ended");
      //   })
      // })
      
      // store.experience.world.districts.scoreboard.on("score_changed", (newScore: number) => {
      //   score.value = newScore;
      // })
    })
  }
});
</script>

<template>
  <main>
    <canvas id="webgl"></canvas>
    <!-- <nav id="nav">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/experience">Experience</RouterLink>
      <RouterLink to="/credits">Credits</RouterLink>
    </nav> -->
    <!-- <RouterView /> -->
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
      <Scoreboard v-if="showScoreboard" :key="score" />
    <!-- <StartGameScreen name="Evan" description="Lorem" /> -->
  </main>
</template>

<style lang="scss" src="./App.scss"></style>
