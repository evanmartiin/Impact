<script setup lang="ts">
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'

const back = () => {
  signal.emit("change_scene", "earth");
}
</script>

<template>
<button class="back" @click="back">
  <div class="shadow">
    <div class="clip">
      <img src="/images/earth.png" alt="">
    </div>
  </div>
</button>
</template>

<style scoped lang="scss">
.back {
  background-color: #FAF7F1;
  position: absolute;
  bottom: 5vw;
  left: 5vw;
  width: 200px;
  clip-path: polygon(24% 100%, 8% 89%, 0 58%, 5% 18%, 43% 0, 81% 6%, 100% 29%, 96% 74%, 78% 97%);
  padding: 10px;
  border: none;

  .shadow {
    filter: drop-shadow(5px 5px 2px rgba(0,0,0,.15));

    .clip {
      color: #84807E;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'CG Heavy';
      clip-path: polygon(24% 100%, 8% 89%, 0 58%, 5% 18%, 43% 0, 81% 6%, 100% 29%, 96% 74%, 78% 97%);
      background-image: url("/images/paper-min.png");
      background-position: center;
      background-size: 120%;
      background-repeat: round;
      border: none;

      img {
        width: 200px;
      }
    }
  }
}
</style>