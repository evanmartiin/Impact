import { AnimationMixer, type AnimationAction } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

type IAnimations = { [key: string]: AnimationAction };
type TAnimName = "idle" | "walk" | "turnleft" | "turnright" | "run" | "none";

export default class AnimationController {
  private animations: {
    [key: string]: {
      anims: IAnimations;
      mixer: AnimationMixer;
      currentAnim: TAnimName;
    };
  } = {};
  private models: string[] = [];

  constructor() {}

  setAnination(modelName: string, model: GLTF) {
    const anims: IAnimations = {};
    const mixer = new AnimationMixer(model.scene);
    model.animations.map((anim) => {
      anims[anim.name] = mixer.clipAction(anim);
    });
    anims["idle"].play();
    this.models.push(modelName);
    this.animations[modelName] = {
      anims: anims,
      mixer: mixer,
      currentAnim: "idle",
    };
  }

  listAnims(modelName: string) {
    console.log(this.animations[modelName]);
  }

  playAnimation(modelName: string, animName: TAnimName) {
    // this.animations[modelName].anims[animName].play();
    // this.prepareCrossFade(
    //   modelName,
    //   this.animations[modelName].anims[this.animations[modelName].currentAnim],
    //   this.animations[modelName].anims[animName],
    //   10
    // );
    this.animations[modelName].anims[
      this.animations[modelName].currentAnim
    ].crossFadeTo(this.animations[modelName].anims[animName], 0.001, true);
  }

  stopAnimation(modelName: string, animName: TAnimName) {
    this.animations[modelName].anims[animName].stop();
  }

  update(deltaTime: number) {
    this.models.map((modelName) => {
      if (this.animations[modelName].mixer) {
        this.animations[modelName].mixer.update(deltaTime * 0.001);
      }
    });
  }

  prepareCrossFade(
    modelName: string,
    startAction: AnimationAction,
    endAction: AnimationAction,
    duration: number
  ) {
    if (
      this.animations[modelName].currentAnim === "idle" ||
      !startAction ||
      !endAction
    ) {
      this.executeCrossFade(startAction, endAction, duration);
    } else {
      this.synchronizeCrossFade(startAction, endAction, duration);
    }
    if (endAction) {
      const clip = endAction.getClip();
      this.animations[modelName].currentAnim = clip.name as TAnimName;
    } else {
      this.animations[modelName].currentAnim = "none";
    }
  }

  executeCrossFade(
    startAction: AnimationAction,
    endAction: AnimationAction,
    duration: number
  ) {
    if (endAction) {
      this.setWeight(endAction, 1);
      endAction.time = 0;
      if (startAction) {
        // Crossfade with warping
        startAction.crossFadeTo(endAction, duration, true);
      } else {
        // Fade in
        endAction.fadeIn(duration);
      }
    } else {
      // Fade out
      startAction.fadeOut(duration);
    }
  }

  synchronizeCrossFade(
    startAction: AnimationAction,
    endAction: AnimationAction,
    duration: number
  ) {
    if (endAction) {
      this.setWeight(endAction, 1);
      endAction.time = 0;
      if (startAction) {
        // Crossfade with warping
        startAction.crossFadeTo(endAction, duration, true);
      } else {
        // Fade in

        endAction.fadeIn(duration);
      }
    } else {
      // Fade out

      startAction.fadeOut(duration);
    }
  }
  setWeight(action: AnimationAction, weight: number) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }
}
