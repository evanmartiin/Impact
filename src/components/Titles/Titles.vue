<script setup lang="ts">
import signal from 'signal-js';
import anime from 'animejs';
import { onMounted, ref } from 'vue';
import { splitLetters } from 'textsplitter';
import type { TitleSource } from '@/models/title.model';

const props = defineProps({
  subtitles: {
    type: Object,
    required: true
  },
  callback: {
    type: Function
  },
  timeout: {
    type: Number
  }
})

const isSubtitlesOn = ref(false);
const titlesTimeline = anime.timeline({});

onMounted(() => {
  signal.on("subtitles_on", subtitlesOn);
  signal.on("subtitles_off", subtitlesOff);
});

const subtitlesOn = () => {
  isSubtitlesOn.value = true;

  startTimeline();
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.subtitles button',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 500,
      delay: 1000,
      easing: 'easeOutBack'
    },
    0
  );
}

const startTimeline = () => {
  const container = document.getElementsByClassName("subtitles")[0] as HTMLElement;
  let totalDuration = 0;

  props.subtitles.forEach((title: TitleSource, index: number) => {
    const pDOM = document.createElement("p");
    pDOM.id = `subtitle-el-${index}`;
    pDOM.classList.add("subtitles-el");
    pDOM.innerHTML = title.text;
    splitLetters(pDOM, `<span class='subtitle-el-${index}' style='display: inline-block'>`, "</span>");
    container.appendChild(pDOM);
    pDOM.style.display = "none";
    
    titlesTimeline.add(
      {
        targets: `.subtitle-el-${index}`,
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutBack',
        delay: anime.stagger(10),
        duration: 200,
        begin: () => {
          pDOM.style.display = "block";
        }
      },
      totalDuration
    );
    totalDuration += title.duration;
    titlesTimeline.add(
      {
        targets: `.subtitle-el-${index}`,
        opacity: [1, 0],
        translateY: [0, 20],
        easing: 'easeOutBack',
        duration: 200,
        complete: () => {
          const nextTitle = props.subtitles[index + 1];
          if (nextTitle) {
            pDOM.style.display = "none";
          } else {
            subtitlesOff();
          }
        }
      },
      totalDuration
    );
    totalDuration += 200;
  });
}

const callback = () => {
  if (props.callback) {
    if (props.timeout) {
      setTimeout(props.callback, props.timeout);
    } else {
      props.callback();
    }
  }
}

const subtitlesOff = () => {
  titlesTimeline.pause();
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.subtitles-el',
      opacity: 0,
      translateY: 100,
      duration: 500,
      delay: anime.stagger(50, { direction: 'reverse' }),
      easing: 'easeOutBack',
      complete: () => {
        isSubtitlesOn.value = true;
        callback();
      }
    },
    0
  );
}
</script>

<template>
<div class="subtitles" v-show="isSubtitlesOn">
  <p class="subtitles-el" id="subtitles-content"></p>
  <button class="subtitles-el" @click="subtitlesOff">Skip</button>
</div>
</template>

<style scoped lang="scss">
.subtitles {
  position: absolute;
  width: 80vw;
  height: 100px;
  bottom: 3vw;
  left: 10vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #FAF7F1;

  p {
    width: 600px;
    text-align: center;
    text-shadow: 4px 4px 4px rgba(13, 28, 81, 0.1);
  }

  button {
    position: absolute;
    right: 0;
    background: transparent;
    color: #FAF7F1;
    border: none;

    &:after {
      position: absolute;
      content: '';
      height: 2px;
      bottom: -2px;
      width: 0%;
      background: white;
      transition: .5s;
      margin: 0;
      left: 5%;
      right: 5%;
    }

    &:hover:after {
      width: 90%;
    }
  }
}
</style>