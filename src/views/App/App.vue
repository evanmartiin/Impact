<script setup lang="ts">
import Experience from "@/webgl/Experience";
import { onMounted, ref } from "vue";
import { webglStore } from '@/stores/webglStore'
import DistrictCard from '@/components/DistrictCard.vue'
import RoundButton from '@/components/RoundButton.vue'
import Maintenance from '@/components/Maintenance.vue'
import Home from '@/components/Home.vue'
import Menu from '@/components/Menu.vue'
import TargetCursor from '@/components/TargetCursor.vue'
import GameStartCounter from '@/components/GameStartCounter.vue'
import Controls from '@/components/Controls.vue'
import signal from 'signal-js';
import anime from "animejs";
import { splitLetters } from 'textsplitter';

const selectedDistrict = ref('');
const showScoreboard = ref(false);
const isMaintenanceOn = ref(false);
const loading = ref(true);
const showLoading = ref(true);
const loadingPct = ref(0);
const cameraReady = ref(false);
const score = ref(0);
const experienceStarted = ref(false);

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
    loading.value = false;
    endLoading();
  })
  signal.on("loading", (pct: number) => {
    loadingPct.value = pct;
    const progressBar = document.getElementById("progress-bar") as HTMLElement;
    progressBar.style.background = `linear-gradient(90deg, rgba(255,255,255,1) ${pct}%, rgba(255,255,255,0) ${pct}%)`;
  })
  signal.on("camera_ready", () => {
    cameraReady.value = true;
    const tl = anime.timeline({});
    tl.add(
      {
        targets: '#start-button',
        opacity: [0, 1],
        translateY: [100, 0],
        duration: 500,
        easing: 'easeOutBack',
        complete: () => {
          const button = document.getElementById('start-button') as HTMLElement;
          button.style.pointerEvents = 'all';
        }
      },
      0
    );
  })

  startLoading();
});


const startLoading = () => {
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.loading-el',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 500,
      delay: anime.stagger(100),
      easing: 'easeOutBack',
      complete: () => {
        const experience = new Experience(document.getElementById("webgl") as HTMLCanvasElement);
      }
    },
    0
  );
  splitLetters(document.getElementById("baseline") as HTMLElement, "<span class='baseline-el' style='display: inline-block'>", "</span>");
  splitLetters(document.getElementById("start-button") as HTMLElement, "<span class='start-el' style='display: inline-block'>", "</span>");
}

const endLoading = () => {
  let alpha = { value: 1 };
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.loading-el',
      opacity: [1, 0],
      translateY: [0, 100],
      duration: 500,
      delay: anime.stagger(100, { start: 2000, direction: 'reverse' }),
      easing: 'easeOutBack',
      complete: () => {
        showLoading.value = false;
      }
    },
    0
  );
  tl.add(
    {
      targets: alpha,
      value: [1, 0],
      duration: 2000,
      delay: 3000,
      easing: "easeOutExpo",
      update: () => {
        const intro = document.getElementById("intro") as HTMLElement;
        intro.style.backgroundColor = `rgba(0, 9, 94, ${alpha.value})`;
      }
    },
    0
  );
  tl.add(
    {
      targets: '.impact-logo',
      scale: [0, 1],
      translateY: [-100, 0],
      duration: 1000,
      delay: anime.stagger(100, { start: 3000 }),
      easing: 'easeOutElastic(2, 1)'
    },
    0
  );
  tl.add(
    {
      targets: '.baseline-el',
      scale: [0, 1],
      translateY: [-50, 0],
      duration: 1000,
      delay: anime.stagger(30, { start: 3000 }),
      easing: 'easeOutBack'
    },
    0
  );
  tl.add(
    {
      targets: '#menu-button',
      opacity: [0, 1],
      translateY: [-100, 0],
      duration: 500,
      delay: 3000,
      easing: 'easeOutBack'
    },
    0
  );
}

const startExperience = () => {
  signal.emit("start_experience");
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.content-el',
      opacity: [1, 0],
      translateY: [0, 50],
      duration: 1000,
      delay: anime.stagger(100, { direction: 'reverse' }),
      easing: 'easeOutBack',
      complete: () => {
        experienceStarted.value = true;
      }
    },
    0
  );
}

const openMenu = () => {
  signal.emit("open_menu");
}
</script>

<template>
  <main>
    <canvas id="webgl" v-show="!loading"></canvas>
    <div id="intro" v-show="!experienceStarted">
      <div class="loading" v-if="showLoading">
        <img id="earth" class="loading-el" src="/images/loader.gif" alt="Earth">
        <div id="progress-bar" class="loading-el"></div>
      </div>
      <div class="content" v-show="!showLoading">
        <div class="text">
          <div class="logo content-el">
            <img class="impact-logo" src="/images/impact_logo/i.png" alt="Impact logo I">
            <img class="impact-logo" src="/images/impact_logo/m.png" alt="Impact logo M">
            <img class="impact-logo" src="/images/impact_logo/p.png" alt="Impact logo P">
            <img class="impact-logo letter-A" src="/images/impact_logo/a.png" alt="Impact logo A">
            <img class="impact-logo" src="/images/impact_logo/c.png" alt="Impact logo C">
            <img class="impact-logo" src="/images/impact_logo/t.png" alt="Impact logo T">
          </div>
          <h2 id="baseline" class="content-el">Save Grandma, Save the Earth !</h2>
        </div>
        <RoundButton id="menu-button" class="content-el" :icon="'menu'" :click="openMenu" />
        <button id="start-button" class="content-el" @click="startExperience">Start Experience</button>
      </div>
    </div>
    <TargetCursor />
    <GameStartCounter />
    <Menu />
    <Controls />
    <DistrictCard v-if="selectedDistrict.length > 0" :name="selectedDistrict" />
    <Maintenance v-if="isMaintenanceOn" />
    <Home v-if="isMaintenanceOn" />
  </main>
</template>

<style lang="scss" src="./App.scss"></style>