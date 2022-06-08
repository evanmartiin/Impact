<script setup>
import { webglStore } from '@/stores/webglStore'
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'
</script>

<template>
<div class="maintenance">
  <div class="shadow">
    <div class="clip">
      <h2>Coming soon</h2>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.maintenance {
  background-color: #FAF7F1;
  position: relative;
  top: 50vh;
  left: 50vw;
  width: 350px;
  transform: translate(-50%, -50%);
  clip-path: polygon(34% 99%, 4% 95%, 0 53%, 3% 11%, 9% 6%, 29% 4%, 52% 0, 89% 5%, 94% 13%, 99% 29%, 100% 60%, 96% 90%, 63% 97%);
  padding: 10px;

  .shadow {
    filter: drop-shadow(5px 5px 2px rgba(0,0,0,.15));

    .clip {
      color: #84807E;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 15px;
      font-family: 'CG Heavy';
      clip-path: polygon(34% 99%, 4% 95%, 0 53%, 3% 11%, 9% 6%, 29% 4%, 52% 0, 89% 5%, 94% 13%, 99% 29%, 100% 60%, 96% 90%, 63% 97%);
      background-image: url("/images/paper-min.png");
      background-position: center;
      background-size: 120%;
      background-repeat: no-repeat;
      border: none;
      padding: 20px;
    }
  }
}
</style>