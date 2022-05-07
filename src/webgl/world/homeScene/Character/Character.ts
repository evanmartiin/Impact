import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import { Group, type Scene } from "three";
import { AnimationMixer, type AnimationAction } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi } from "tweakpane";
import SeedFocus from "@/webgl/world/homeScene/SeedFocus/SeedFocus";

interface IAnimation {
  mixer: AnimationMixer | null;
  actions: { [key: string]: AnimationAction };
  play: null | ((name: string) => void);
}
type TSpeed = "fast" | "slow";

export default class Character {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected scene: Scene | null = null;
  protected time: Time = this.experience.time as Time;
  public instance: Group | null = null;
  public items: Group = new Group();
  private isDisplayed = false;
  private isInit = false;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  private model: GLTF | null = null;
  private animation: IAnimation = {
    mixer: null,
    actions: {},
    play: null,
  };
  private speed: TSpeed = "fast";
  private seedFocus: SeedFocus | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  init() {
    this.model = this.loaders.items["homeGameCharacter"] as GLTF;
    this.instance = this.model.scene;
    if (this.instance) {
      this.instance?.scale.set(0.25, 0.25, 0.25);
      this.instance?.position.set(-0.4, 0.3, 2.2);
      this.instance.rotation.y = 0.54;
      this.seedFocus = new SeedFocus(this.scene as Scene);
      this.seedFocus.appear();
      this.items.add(this.seedFocus.instance);
      this.instance.add(this.items);
      this.scene?.add(this.instance);
      this.setDebug();
      this.setAnimation();
    }
    this.isDisplayed = true;
    this.isInit = true;
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.pages[1].addFolder({ title: "Character" });
    if (this.instance?.position) {
      this.debugFolder?.addInput(this.instance?.position, "x", {
        min: -10,
        max: 10,
        step: 0.1,
      });
      this.debugFolder?.addInput(this.instance?.position, "y", {
        min: -10,
        max: 10,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.instance?.position, "z", {
        min: -10,
        max: 10,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.instance?.rotation, "y", {
        min: -5,
        max: 5,
        step: 0.01,
      });
    }
  }
  setAnimation() {
    // Mixer
    this.animation.mixer = new AnimationMixer((this.model as GLTF)?.scene);

    // Actions
    this.animation.actions = {};
    if (this.model && this.animation) {
      this.animation.actions["fast"] = this.animation.mixer.clipAction(
        this.model.animations[0]
      );
      this.animation.actions["slow"] = this.animation.mixer.clipAction(
        this.model.animations[1]
      );

      this.animation.actions["current"] = this.animation.actions.fast;
      this.animation.actions.current.play();
      // Play the action
      this.animation.play = (name) => {
        const newAction = this.animation.actions[name];
        const oldAction = this.animation.actions.current;
        newAction.reset();
        newAction.play();
        newAction.crossFadeFrom(oldAction, 1, false);
        this.animation.actions.current = newAction;
      };
    }

    // Debug
    if (this.debug.active) {
      const playFast = this.debugFolder?.addButton({
        title: "playFast",
      });
      const playSlow = this.debugFolder?.addButton({
        title: "playSlow",
      });
      playFast?.on("click", () => this.setSpeed("fast"));
      playSlow?.on("click", () => this.setSpeed("slow"));
    }
  }

  setSpeed(speed: TSpeed) {
    if (this.animation?.play) {
      this.animation.play(speed);
      this.speed = speed;
    }
  }

  appear() {
    if (!this.isInit) {
      this.init();
    } else {
      if (this.instance) this.instance.visible = true;
      this.seedFocus?.appear();
    }
    this.isDisplayed = true;
  }

  disappear() {
    if (this.isInit && this.isDisplayed) {
      if (this.instance) this.instance.visible = false;
      this.isDisplayed = false;
      this.seedFocus?.disappear();
    }
  }

  update() {
    if (this.isDisplayed) {
      this.animation.mixer?.update(this.time.delta * 0.001);
    }
  }
}
