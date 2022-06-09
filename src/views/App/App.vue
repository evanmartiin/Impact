<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import CustomButton from '@/components/CustomButton.vue'
import Maintenance from '@/components/Maintenance.vue'
import Home from '@/components/Home.vue'
import signal from 'signal-js';

const selectedDistrict = ref('');
const showScoreboard = ref(false);
const isMaintenanceOn = ref(false);
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
  signal.on("maintenance_on", () => {
    isMaintenanceOn.value = true;
  })
  signal.on("maintenance_off", () => {
    isMaintenanceOn.value = false;
  })
});
</script>

<template>
  <main>
    <canvas id="webgl"></canvas>
    <div id="intro" v-if="!experienceStarted">
      <div class="logo">
        <img src="/images/impact_logo.png" alt="Impact logo">
        <h2>Save Grandma, Save the Earth!</h2>
      </div>
      <CustomButton :click="start">Start Experience</CustomButton>
      <div class="credits">
        <img src="/images/gobelins_logo.png" alt="Gobelins logo">
        <p>Ambroise Nicolao - Danut Miculas - Ludwig Pilicer - Evan Martin - Antoine Tardivel - Timon Idrissi</p>
        <img src="/images/cci_logo.png" alt="CCI logo">
      </div>
    </div>
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
    <Maintenance v-if="isMaintenanceOn" />
    <Home v-if="isMaintenanceOn" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>