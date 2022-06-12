<script setup>
import signal from 'signal-js';

const props = defineProps({
  click: {
    type: Function,
    required: true
  }
})

const clickSound = () => {
  signal.emit("play_sound", "button");
}
</script>

<template>
<button @click="props.click(); clickSound();">
  <div class="shadow">
    <div class="clip">
      <slot />
    </div>
  </div>
</button>
</template>

<style scoped lang="scss">
button {
  background-color: #EBE7E0;
  color: #0D1C51;
  border: none;
  clip-path: polygon(2% 4%, 46% 0, 98% 5%, 100% 61%, 98% 94%, 54% 99%, 2% 97%, 0 39%);
  padding: 5px;
  width: 170px;
  font-size: 18px;
  text-transform: uppercase;
  
  &:hover {
    cursor: pointer;
  }

  .shadow {
    box-shadow: 1px 1px 2px rgba(13, 28, 81, .1);

    .clip {
      clip-path: polygon(1% 5%, 53% 0, 99% 5%, 100% 54%, 99% 97%, 49% 100%, 1% 97%, 0 51%);
      background-image: url("/images/paper-min.png");
      background-position: center;
      background-size: 110%;
      background-repeat: no-repeat;
      border: none;
      padding: 10px 20px;
    }
  }
}
</style>