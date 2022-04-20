import type Debug from "@/webgl/controllers/Debug";
import type AnimationController from "@/webgl/controllers/AnimationController";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import type { Group, Scene } from "three";
import { AnimationMixer, type AnimationAction } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi } from "tweakpane";

interface IAnimation {
  mixer: AnimationMixer | null;
  actions: { [key: string]: AnimationAction };
  play: null | ((name: string) => void);
}

export default class Character {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected scene: Scene = this.experience.scene as Scene;
  protected time: Time = this.experience.time as Time;
  public instance: Group | null = null;
  private isDisplayed = false;
  private isInit = false;
  private animationController: AnimationController = this.experience
    .animationController as AnimationController;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  private model: GLTF | null = null;
  private animation: IAnimation = {
    mixer: null,
    actions: {},
    play: null,
  };
  private walkdirection: "idle" | "right" | "left" = 'idle';

  constructor() {}

  init() {
    this.model = this.loaders.items["character"] as GLTF;
    this.instance = this.model.scene;
    if (this.instance) {
      this.instance?.scale.set(0.25, 0.25, 0.25);
      this.instance?.position.set(0, 0.3, 2.35);
      this.scene.add(this.instance);
      this.setDebug();
      this.setAnimation();
    }
    this.isDisplayed = true;
    this.isInit = true;
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.addFolder({ title: "Character" });
  }
  setAnimation() {
    // Mixer

    this.animation.mixer = new AnimationMixer((this.model as GLTF)?.scene);

    // Actions
    this.animation.actions = {};
    if (this.model && this.animation) {
      this.animation.actions["halfturn"] = this.animation.mixer.clipAction(
        this.model.animations[0]
      );
      this.animation.actions["idle"] = this.animation.mixer.clipAction(
        this.model.animations[1]
      );
      this.animation.actions["run"] = this.animation.mixer.clipAction(
        this.model.animations[2]
      );
      this.animation.actions["walk"] = this.animation.mixer.clipAction(
        this.model.animations[3]
      );

      this.animation.actions["current"] = this.animation.actions.idle;
      this.animation.actions["current"].play();
      // Play the action
      this.animation.play = (name) => {
        const newAction = this.animation.actions[name];
        const oldAction = this.animation.actions["current"];

        newAction.reset();
        newAction.play();
        newAction.crossFadeFrom(oldAction, 1, false);

        this.animation.actions.current = newAction;
      };
    }

    // Debug
    if (this.debug.active) {
      const playIdle = this.debugFolder?.addButton({
        title: "playIdle",
      });
      const playWalk = this.debugFolder?.addButton({
        title: "playWalk",
      });
      const playRun = this.debugFolder?.addButton({
        title: "playRun",
      });
      const playHalfTurn = this.debugFolder?.addButton({
        title: "playHalfTurn",
      });
      playIdle?.on("click", () => {
        if (this.animation.play) this.animation.play("idle");
      });
      playWalk?.on("click", () => {
        if (this.animation.play) this.animation.play("walk");
      });
      playRun?.on("click", () => {
        if (this.animation.play) this.animation.play("run");
      });
      playHalfTurn?.on("click", () => {
        if (this.animation.play) this.animation.play("halfturn");
      });
    }
  }

  walkLeft(state: "up" | "down") {
    if (state === "up" && this.animation.play) {
      this.animation.play("halfturn");
      setTimeout(() => {
        if (this.animation.play) this.animation.play("run");
        this.walkdirection = "left";
      }, 300);
    } else if (this.animation.play) {
      this.animation.play("halfturn");
      setTimeout(() => {
        if (this.animation.play) this.animation.play("idle");
        this.walkdirection = "idle";
      }, 300);
    }
  }

  walkRight(state: "up" | "down") {
    if (state === "up" && this.animation.play) {
      this.animation.play("halfturn");
      setTimeout(() => {
        if (this.animation.play) this.animation.play("run");
        this.walkdirection = "right";
      }, 300);
    } else if (this.animation.play) {
      this.animation.play("halfturn");
      setTimeout(() => {
        if (this.animation.play) this.animation.play("idle");
        this.walkdirection = "idle";
      }, 300);
    }
  }

  stopWalk() {}

  turn(direction: "right" | "left") {}

  appear() {
    if (!this.isInit) {
      this.init();
    } else {
      if (this.instance) this.instance.visible = true;
    }
    this.isDisplayed = true;
  }

  disappear() {
    if (this.isInit && this.isDisplayed) {
      if (this.instance) this.instance.visible = false;
      this.isDisplayed = false;
    }
  }

  update() {
    this.animation.mixer?.update(this.time.delta * 0.001);
  }
}
