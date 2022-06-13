import type { SoundSource } from "@/models/webgl/sound.model";

const SoundSources: SoundSource[] = [
  {
    name: "fire",
    params: {
      src: "/sounds/fire.mp3"
    },
  },
  {
    name: "ambient-home",
    params: {
      src: "/sounds/ambient-home.mp3",
      loop: true,
      volume: .3
    },
  },
  {
    name: "camera-intro",
    params: {
      src: "/sounds/camera-intro.mp3",
      volume: .2
    },
  },
  {
    name: "pop-tree",
    params: {
      src: "/sounds/pop-tree.mp3"
    },
  },
  {
    name: "button",
    params: {
      src: "/sounds/button.mp3"
    },
  },
];

export default SoundSources;
