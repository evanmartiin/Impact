import type { AnimationAction, AnimationMixer } from "three";

interface IAnimation {
  mixer: AnimationMixer | null;
  actions: { [key: string]: AnimationAction };
  play: null | ((name: string) => void);
}
export default IAnimation;
