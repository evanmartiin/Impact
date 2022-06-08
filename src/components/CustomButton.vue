<script setup>
const props = defineProps({
  click: {
    type: Function,
    required: true
  }
})
</script>

<template>
<button @click="props.click">
  <div class="shadow">
    <div class="clip">
      <slot />
    </div>
  </div>
</button>
</template>

<style scoped lang="scss">
button {
  background-color: #A7DF49;
  color: #0D1C51;
  border: none;
  clip-path: polygon(2% 4%, 46% 0, 98% 5%, 100% 61%, 98% 94%, 54% 99%, 2% 97%, 0 39%);
  padding: 5px;
  font-size: 18px;
  text-transform: uppercase;
  
  &:hover {
    cursor: pointer;
  }

  .shadow {
    filter: drop-shadow(1px 1px 2px rgba(0,0,0,.15));

    .clip {
      clip-path: polygon(1% 5%, 53% 0, 99% 5%, 100% 54%, 99% 97%, 49% 100%, 1% 97%, 0 51%);
      background-image: url("images/button.png");
      background-position: center;
      background-size: 110%;
      background-repeat: no-repeat;
      border: none;
      padding: 10px 20px;
    }
  }
}
</style>