<script setup>

import signal from 'signal-js';
import { onMounted, ref } from 'vue';

const props = defineProps({});

const isHidden = ref(true);

onMounted(() => {
  signal.on("set_target_cursor", (e) => isHidden.value = e);
});

</script>

<template>
<div id="targetCursor">
    <!-- <div class="progress-circle">
        <div class="progress-masque">
        </div>
    </div> -->
    <img :src="`images/cursors/targetCursor.png`" :class="{ disabled: isHidden }" alt="">
</div>
</template>

<style scoped lang="scss">
// .progress-masque {
//   position: absolute;
//   width: 1em;                     /* 100% de la largeur */
//   height: 1em;                    /* 100% de la hauteur */
//   left: -.15em;                   /* décalage de la largeur bordure de la gauge */
//   top: -.15em;                    /* décalage de la largeur bordure de la gauge */
//   clip: rect(0, 1em, 1em, .5em);  /* par défaut seule la partie droite est visible */
// }
// .progress-circle[data-value^='5']:not([data-value='5']):not([data-value^='5.']) .progress-masque,
// .progress-circle[data-value^='6']:not([data-value='6']):not([data-value^='6.']) .progress-masque,
// .progress-circle[data-value^='7']:not([data-value='7']):not([data-value^='7.']) .progress-masque,
// .progress-circle[data-value^='8']:not([data-value='8']):not([data-value^='8.']) .progress-masque,
// .progress-circle[data-value^='9']:not([data-value='9']):not([data-value^='9.']) .progress-masque,
// .progress-circle[data-value^='100'] .progress-masque {
//   clip: rect(auto, auto, auto, auto);
// }
#targetCursor {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate3D(-50%, -50%, 0);
    img {
        width: 40px;
        &.disabled {
            display: none;
        }
    }
}
</style>