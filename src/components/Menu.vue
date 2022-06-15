<script setup>
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'
import anime from 'animejs';
import { onMounted, ref } from 'vue';

const isMenuOpened = ref(false);
const isSoundOn = ref(true);
const menuMode = ref('basic');
const isMoving = ref(false);

const click = () => {
  if(!isMoving.value){
  }
}

onMounted(() => {
  signal.on("open_menu", openMenu);
  signal.on("close_menu", closeMenu);
});

const toggleSound = () => {
  if(!isMoving.value){
    isSoundOn.value = !isSoundOn.value;
    signal.emit("toggle_sound");
  }
}

const openMenu = (e) => {
  if(!isMoving.value){
    isMoving.value = true;
    isMenuOpened.value = true
    menuMode.value = e;
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
        complete: () =>{
          isMoving.value = false;
        }
      },
      0
    );
  }
}

const closeMenu = () => {
  if(!isMoving.value){
    isMoving.value = true;
    if(menuMode.value === 'seedGameMode'){
      signal.emit('resume_game')
      menuMode.value = 'basic'
    }
    let blur = { value: 10 };
    
    const tl = anime.timeline({});
    tl.add(
      {
        targets: '.menu-el',
        opacity: [1, 0],
        translateY: [0, 100],
        duration: 500,
        delay: anime.stagger(50, { direction: 'reverse' }),
        easing: 'easeOutBack',
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
          isMoving.value = false;
        }
      },
      0
    );
  }
}
</script>

<template>
<div class="menu" v-show="isMenuOpened">
  <h1 class="menu-el">Menu</h1>
  <div class="buttons">
    <CustomButton :disabled="isMoving" class="menu-el" :click="closeMenu">Resume</CustomButton>
    <CustomButton :disabled="isMoving" class="menu-el" :click="click">Restart</CustomButton>
    <CustomButton :disabled="isMoving" class="menu-el" :click="click">Home</CustomButton>
    <CustomButton :disabled="isMoving" class="menu-el" :click="toggleSound" :off="!isSoundOn">Sound {{ isSoundOn ? 'On' : 'Off' }}</CustomButton>
    <CustomButton :disabled="isMoving" class="menu-el" :click="click">Credits</CustomButton>
  </div>
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
    line-height: 114px;
    text-shadow: 4px 4px 4px rgba(13, 28, 81, 0.1);
  }

  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
}

@media (max-width: 500px) {
  .menu {

    h1 {
      font-size: 80px;
      line-height: 50px;
      margin-top: 100px;
    }
  }
}
</style>