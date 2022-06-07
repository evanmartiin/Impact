<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import CustomButton from '@/components/CustomButton.vue'
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

  signal.on("change_scene", () => {
    selectedDistrict.value = "";
  })
  signal.on("district_selected", (district: any) => {
    selectedDistrict.value = district.name;
  })
  signal.on("no_district_selected", () => {
    selectedDistrict.value = "";
  })
  signal.on("district_hovered", () => {
    document.body.style.cursor = 'pointer';
  })
  signal.on("no_district_hovered", () => {
    document.body.style.cursor = 'initial';
  })
});
</script>

<template>
  <main>
    <canvas id="webgl"></canvas>
    <div id="home" v-if="!experienceStarted">
      <h1>IMPACT</h1>
      <h2>Tagline un peu cool</h2>
      <CustomButton :click="start">Start Experience</CustomButton>
    </div>
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>