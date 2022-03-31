<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import Lifebar from '@/components/Lifebar.vue'

const selectedDistrict = ref('');

onMounted(() => {
  const experience = new Experience(document.getElementById("webgl") as HTMLCanvasElement);
  const store = webglStore();
  store.$state = { experience };
  store.experience.loaders.on('ready', () => {
    store.experience.world.districts.on('district_selected', (district) => {
      selectedDistrict.value = district.name;
    })
    store.experience.world.districts.on('no_district_selected', () => {
      selectedDistrict.value = '';
    })
  })
});
</script>

<template>
  <main>
    <canvas id="webgl"></canvas>
    <nav id="nav">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/experience">Experience</RouterLink>
      <RouterLink to="/credits">Credits</RouterLink>
    </nav>
    <RouterView />
    <Lifebar />
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>
