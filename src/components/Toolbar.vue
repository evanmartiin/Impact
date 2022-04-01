<script setup>
import Icon from './Icon.vue';
</script>

<template>
<div class="toolbar">
    <Icon image="phone" />
    <Icon image="bike" />
</div>
</template>

<style scoped lang="scss">
.toolbar {
    position: absolute;
    display: flex;
    margin-top: 30px;
    right: 30px;
    gap: 20px;
}
</style>