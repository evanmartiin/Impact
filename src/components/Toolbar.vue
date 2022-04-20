<script setup>
import Icon from './Icon.vue';

const props = defineProps({
    tools: {
        type: Array,
        required: true
    }
})
</script>

<template>
<div class="toolbar">
    <div v-for="tool in tools" :key="tool">
        <Icon :image="tool" />
    </div>
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