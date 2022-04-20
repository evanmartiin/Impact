<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import Lifebar from '@/components/Lifebar.vue'
import Toolbar from '@/components/Toolbar.vue'

const selectedDistrict = ref('');
const ownedTools = ref([]);

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
  store.experience.world.toolbox.on('tool_added', (tool) => {
    ownedTools.value.push(tool);
  })
  store.experience.world.toolbox.on('tool_removed', (tool) => {
    const index = ownedTools.value.findIndex((el) => el === tool);
    ownedTools.value.splice(index, 1);
  })
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
    <!-- <Lifebar /> -->
    <!-- <Toolbar :tools="ownedTools" /> -->
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>
