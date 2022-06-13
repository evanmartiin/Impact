<script setup>
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'
import RoundButton from '@/components/RoundButton.vue'
import anime from 'animejs';
import { onMounted, ref } from 'vue';

const isMenuOpened = ref(false);
const soundIcon = ref('sound-on');

const click = () => {
  
}

onMounted(() => {
  signal.on("open_menu", openMenu);
  signal.on("close_menu", closeMenu);
});

const toggleSound = () => {
  soundIcon.value = soundIcon.value === 'sound-on' ? 'sound-off' : 'sound-on';
  signal.emit("toggle_sound");
}

const openMenu = () => {
  isMenuOpened.value = true;
  let blur = { value: 0 };
  
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.menu-el',
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
        const menu = document.getElementsByClassName('menu')[0];
        menu.style.backdropFilter = `blur(${blur.value}px)`;
        menu.style.webkitBackdropFilter = `blur(${blur.value}px)`;
      },
    },
    0
  );
}

const closeMenu = () => {
  let blur = { value: 10 };
  
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.menu-el',
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
        const menu = document.getElementsByClassName('menu')[0];
        menu.style.backdropFilter = `blur(${blur.value}px)`;
        menu.style.webkitBackdropFilter = `blur(${blur.value}px)`;
      },
      complete: () => {
        isMenuOpened.value = false;
      }
    },
    0
  );
}
</script>

<template>
<div class="menu" v-show="isMenuOpened">
  <h1 class="menu-el">Menu</h1>
  <div class="buttons">
    <CustomButton class="menu-el" :click="closeMenu">Resume</CustomButton>
    <CustomButton class="menu-el" :click="click">Restart</CustomButton>
    <CustomButton class="menu-el" :click="click">Main menu</CustomButton>
    <RoundButton class="menu-el" :icon="soundIcon" :click="toggleSound" />
    <CustomButton class="menu-el" :click="click">Credits</CustomButton>
  </div>
  <RoundButton class="menu-el" id="close-menu" :icon="'close'" :click="closeMenu" />
</div>
</template>

<style scoped lang="scss">
.menu {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  color: #FAF7F1;

  h1 {
    text-transform: uppercase;
    font-size: 150px;
    text-shadow: 4px 4px 4px rgba(13, 28, 81, 0.1);
  }

  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  #close-menu {
    position: absolute;
    top: 50px;
    right: 50px;
  }
}
</style>