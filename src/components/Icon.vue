<script setup>
const props = defineProps({
    image: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean
    }
})
</script>

<template>
<div class="icon">
    <img :src="`images/${image}.png`" :class="{ disabled: props.disabled }" alt="">
</div>
</template>

<style scoped lang="scss">
.icon {
    background-color: #B5B2B0;
    padding: 20px;
    width: 100px;
    height: 100px;
    border-radius: 25px;
    color: #84807E;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
        width: 80px;

        &.disabled {
            filter: grayscale(1);
        }
    }
}
</style>