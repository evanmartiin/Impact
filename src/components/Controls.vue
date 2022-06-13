<script setup>
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'
import anime from 'animejs';
import { onMounted, ref } from 'vue';

const isControlsOpened = ref(false);
const soundIcon = ref('sound-on');

onMounted(() => {
  signal.on("open_controls", openControls);
  signal.on("close_controls", closeControls);
});

const openControls = () => {
  isControlsOpened.value = true;
  let blur = { value: 0 };
  
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.controls-el',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 500,
      delay: anime.stagger(50),
      easing: 'easeOutBack'
    },
    0
  );
  tl.add(
    {
      targets: blur,
      value: 10,
      duration: 1000,
      easing: 'easeOutBack',
      update: () => {
        const controls = document.getElementsByClassName('controls')[0];
        controls.style.backdropFilter = `blur(${blur.value}px)`;
        controls.style.webkitBackdropFilter = `blur(${blur.value}px)`;
        controls.style.backgroundColor = `rgba(13, 28, 81, ${blur.value/20})`;
      },
    },
    0
  );
}

const closeControls = () => {
  let blur = { value: 10 };
  
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.controls-el',
      opacity: [1, 0],
      translateY: [0, 100],
      duration: 500,
      delay: anime.stagger(50, { direction: 'reverse' }),
      easing: 'easeOutBack'
    },
    0
  );
  tl.add(
    {
      targets: blur,
      value: 0,
      duration: 1000,
      easing: 'easeOutBack',
      update: () => {
        const controls = document.getElementsByClassName('controls')[0];
        controls.style.backdropFilter = `blur(${blur.value}px)`;
        controls.style.webkitBackdropFilter = `blur(${blur.value}px)`;
        controls.style.backgroundColor = `rgba(13, 28, 81, ${blur.value/20})`;
      },
      complete: () => {
        isControlsOpened.value = false;
        signal.emit('game:launch')
      }
    },
    0
  );
}
</script>

<template>
<div class="controls" v-show="isControlsOpened">
  <h1 class="controls-el">Plant as much trees as possible</h1>
  <img class="controls-el" src="/images/controls.png" alt="Controls">
  <CustomButton class="controls-el" :click="closeControls">Play</CustomButton>
</div>
</template>

<style scoped lang="scss">
.controls {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(13, 28, 81, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80px;
  color: #FAF7F1;

  h1 {
    font-size: 40px;
    width: 600px;
    text-align: center;
    text-shadow: 4px 4px 4px rgba(13, 28, 81, 0.1);
  }

  img {
    width: 200px;
  }
}
</style>