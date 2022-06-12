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
];

export default SoundSources;
