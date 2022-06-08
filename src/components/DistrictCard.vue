<script setup>
import { webglStore } from '@/stores/webglStore'
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const changeScene = (name) => {
  signal.emit("change_scene", name);
}

const store = webglStore();
</script>

<template>
<div class="district-card">
  <div class="shadow">
    <div class="clip">
      <h2>{{ props.name }}</h2>
      <CustomButton :click="() => changeScene(props.name)">Move here</CustomButton>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.district-card {
    background-color: #FAF7F1;
    position: relative;
    top: 50vh;
    left: 50vw;
    width: 350px;
    transform: translate(-50%, calc(-50% + 50px));
    clip-path: polygon(12% 100%, 4% 95%, 0 53%, 4% 26%, 10% 20%, 43% 17%, 52% 0, 58% 17%, 87% 19%, 95% 25%, 100% 60%, 96% 90%, 63% 97%);
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
      clip-path: polygon(12% 100%, 4% 95%, 0 53%, 4% 26%, 10% 20%, 43% 17%, 52% 0, 58% 17%, 87% 19%, 95% 25%, 100% 60%, 96% 90%, 63% 97%);
      background-image: url("images/paper-min.png");
      background-position: center;
      background-size: 120%;
      background-repeat: no-repeat;
      border: none;
      padding: 30px 20px 20px 20px;
    }
  }
}
</style>