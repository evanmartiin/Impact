<script setup>
import Icon from './Icon.vue';
import { webglStore } from '@/stores/webglStore'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const store = webglStore();
</script>

<template>
<div class="district-card">
    <h2>{{ props.name }}</h2>
    <span/>

    <div class="required">
        <p>Required</p>
        <Icon image="phone" />
    </div>

    <div class="available-transport">
        <p>Available means of transport</p>
        <div>
            <Icon image="bus" :disabled="true" />
            <Icon image="bike" />
        </div>
    </div>

    <button @click="() => { store.experience.world.changeScene(props.name) }">Move here</button>

    <div class="selector"></div>
</div>
</template>

<style scoped lang="scss">
.district-card {
    background-color: #FAF7F1;
    padding: 20px;
    position: relative;
    top: 50vh;
    left: 50vw;
    width: 300px;
    transform: translate(calc(-50% - 400px), calc(-50% - 50px));
    padding: 30px 30px;
    border-radius: 50px;
    color: #84807E;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 25px;
    font-family: 'CG Heavy';

    span {
        width: 60%;
        height: 4px;
        background-color: #84807E;
        border-radius: 50px;
    }

    .required, .available-transport {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;

        p {
            font-size: 16px;
            max-width: 60%;
            margin-bottom: 10px;
            text-align: center;
            font-family: 'CG Bold';
        }

        div {
            display: flex;
            align-items: center;
            gap: 20px;
        }
    }

    .selector {
        width: 50px;
        height: 50px;
        background-color: #FAF7F1;
        position: absolute;
        right: -15px;
        top: 100px;
        transform: rotateZ(-30deg) skew(30deg);
    }
}
</style>