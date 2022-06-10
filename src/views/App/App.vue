<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import CustomButton from '@/components/CustomButton.vue'
import Maintenance from '@/components/Maintenance.vue'
import Home from '@/components/Home.vue'
import signal from 'signal-js';
import anime from "animejs";
import { splitLetters } from 'textsplitter';


const selectedDistrict = ref('');
const showScoreboard = ref(false);
const isMaintenanceOn = ref(false);
const loading = ref(true);
const loadingPct = ref(0);
const cameraReady = ref(false);
const score = ref(0);
const experienceStarted = ref(false);

const start = () => {
  experienceStarted.value = true;
  signal.emit("start_experience");
}

onMounted(() => {
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
  signal.on("loaders_ready", () => {
    setTimeout(() => {
      loading.value = false;
      endLoading();
    }, 1000);
  })
  signal.on("loading", (pct: number) => {
    loadingPct.value = pct;
    const progressBar = document.getElementById("progress-bar") as HTMLElement;
    progressBar.style.background = `linear-gradient(90deg, rgba(200,255,191,1) ${pct}%, rgba(255,210,210,1) ${pct}%)`;
  })
  signal.on("camera_ready", () => {
    cameraReady.value = true;
  })

  animLogo();
});


const animLogo = () => {
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.impact-logo',
      scale: [0, 1],
      translateY: [-100, 0],
      duration: 1000,
      delay: anime.stagger(100),
      easing: 'easeOutBack',
      complete: () => {
        const experience = new Experience(document.getElementById("webgl") as HTMLCanvasElement);
      }
    },
    0
  );

  splitLetters(document.getElementById("baseline") as HTMLElement, "<span class='baseline-el' style='display: inline-block'>", "</span>");

  tl.add(
    {
      targets: '.baseline-el',
      scale: [0, 1],
      translateY: [-50, 0],
      duration: 1000,
      delay: anime.stagger(30),
      easing: 'easeOutBack'
    },
    0
  );
  tl.add(
    {
      targets: '#progress-bar',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 500,
      easing: 'easeOutBack',
    },
    0
  );
}

const endLoading = () => {
  let alpha = { value: 1 };
  const tl = anime.timeline({});
  tl.add(
    {
      targets: alpha,
      value: [1, 0],
      duration: 2000,
      easing: "easeOutExpo",
      update: () => {
        const intro = document.getElementById("intro") as HTMLElement;
        intro.style.backgroundColor = `rgba(0, 9, 94, ${alpha.value})`;
      }
    },
    0
  );
  
}
</script>

<template>
  <main>
    <canvas id="webgl" v-show="!loading"></canvas>
    <div id="intro" v-show="!experienceStarted">
      <div class="content">
        <div class="logo">
          <img class="impact-logo" src="/images/impact_logo/i.png" alt="Impact logo I">
          <img class="impact-logo" src="/images/impact_logo/m.png" alt="Impact logo M">
          <img class="impact-logo" src="/images/impact_logo/p.png" alt="Impact logo P">
          <img class="impact-logo letter-A" src="/images/impact_logo/a.png" alt="Impact logo A">
          <img class="impact-logo" src="/images/impact_logo/c.png" alt="Impact logo C">
          <img class="impact-logo" src="/images/impact_logo/t.png" alt="Impact logo T">
        </div>
        <h2 id="baseline">Save Grandma, Save the Earth!</h2>
      </div>
      <div id="progress-bar" v-if="loading"></div>
      <CustomButton id="start-button" :click="start" v-if="cameraReady">Start Experience</CustomButton>

      <!-- <div class="credits">
        <img src="/images/gobelins_logo.png" alt="Gobelins logo">
        <p>Ambroise Nicolao - Danut Miculas - Ludwig Pilicer - Evan Martin - Antoine Tardivel - Timon Idrissi</p>
        <img src="/images/cci_logo.png" alt="CCI logo">
      </div> -->
    </div>
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
    <Maintenance v-if="isMaintenanceOn" />
    <Home v-if="isMaintenanceOn" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>