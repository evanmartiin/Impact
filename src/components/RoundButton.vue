<script setup>
import signal from 'signal-js';

const props = defineProps({
  click: {
    type: Function,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean
  }
})

const clickSound = () => {
  signal.emit("play_sound", "button");
}
</script>

<template>
<button @click="props.click(); clickSound();" :disabled="props.disabled">
  <div class="inner">
    <img :src="'/images/buttons/' + props.icon + '.png'" alt="Icône">
  </div>
</button>
</template>

<style scoped lang="scss">
button {
  background: #EBE7E0;
  border-radius: 50%;
  box-shadow: 1px 1px 2px rgba(13, 28, 81, 0.15);
  border: none;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  .inner {
    background: #FAF7F1;
    border-radius: 50%;
    box-shadow: 1px 1px 2px rgba(13, 28, 81, 0.15);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 30px;
    }
  }
}

@media (max-width: 500px) {
  button {
    width: 50px;
    height: 50px;

    .inner {
      width: 40px;
      height: 40px;

      img {
        width: 25px;
      }
    }
  }
}
</style>