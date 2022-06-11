import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  sRGBEncoding,
  Texture,
  type Scene,
  type Shader,
} from "three";
import { AnimationMixer, type AnimationAction } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi } from "tweakpane";
import fragment from "./Shaders/fragment.glsl?raw";
import vertex from "./Shaders/vertex.glsl?raw";

interface IAnimation {
  mixer: AnimationMixer | null;
  actions: { [key: string]: AnimationAction };
  play: null | ((name: string) => void);
}
type TAnimationName =
  | "aimtodown"
  | "downtoaim"
  | "fire"
  | "idle"
  | "rifleidle"
  | "win";

export default class Billy {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected scene: Scene | null = null;
  protected time: Time = this.experience.time as Time;
  public instance: Group | null = null;
  public items: Group = new Group();
  private isDisplayed = false;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;

  private model: GLTF | null = null;
  private material: ShaderBaseMaterial | null = null;
  private texture: Texture | null = null;
  private currentAnim: TAnimationName = "rifleidle";
  private animation: IAnimation = {
    mixer: null,
    actions: {},
    play: null,
  };

  constructor(scene: Scene) {
    this.scene = scene;
    this.setDebug();
    this.init();
  }

  init() {
    this.model = this.loaders.items["billy-model"] as GLTF;
    this.texture = this.loaders.items["billy-texture"] as Texture;
    this.texture.flipY = false;
    this.texture.encoding = sRGBEncoding;
    this.material = new ShaderBaseMaterial({
      transparent: true,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        uTexture: { value: this.texture },
      },
    });
    // this.model.scene.traverse((child) => {
    //   if (child instanceof Mesh && this.texture) {
    //     child.material = this.material;
    //   }
    // });
    console.log(this.model);

    this.instance = this.model.scene;
    this.instance.scale.set(1, 1, 1);
    this.instance.position.set(0, 0, 0.1);
    this.scene?.add(this.instance);
    this.setAnimation();

    this.isDisplayed = true;
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.pages[2].addFolder({
      title: "Character",
    });
  }
  setAnimation() {
    // Mixer
    this.animation.mixer = new AnimationMixer((this.model as GLTF)?.scene);

    // Actions
    this.animation.actions = {};
    if (this.model && this.animation) {
      this.animation.actions["aimtodown"] = this.animation.mixer.clipAction(
        this.model.animations[0]
      );
      this.animation.actions["downtoaim"] = this.animation.mixer.clipAction(
        this.model.animations[1]
      );
      this.animation.actions["fire"] = this.animation.mixer.clipAction(
        this.model.animations[2]
      );
      this.animation.actions["idle"] = this.animation.mixer.clipAction(
        this.model.animations[3]
      );
      this.animation.actions["rifleidle"] = this.animation.mixer.clipAction(
        this.model.animations[4]
      );
      this.animation.actions["win"] = this.animation.mixer.clipAction(
        this.model.animations[5]
      );

      this.animation.actions["current"] =
        this.animation.actions[this.currentAnim];
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
      const playWin = this.debugFolder?.addButton({
        title: "Play win",
      });
      const playRifleIdle = this.debugFolder?.addButton({
        title: "Play rifle idle",
      });
      playWin?.on("click", () => this.setAnim("win"));
      playRifleIdle?.on("click", () => this.setAnim("rifleidle"));
    }
  }

  setAnim(animName: TAnimationName) {
    if (this.animation?.play) {
      this.animation.play(animName);
      this.currentAnim = animName;
    }
  }

  set() {
    if (!this.isDisplayed) {
      if (this.instance) this.instance.visible = true;
    }
  }

  unset() {
    if (this.isDisplayed) {
      if (this.instance) this.instance.visible = false;
      this.isDisplayed = false;
    }
  }

  update() {
    if (this.isDisplayed) {
      this.animation.mixer?.update(this.time.delta * 0.001);
    }
  }
}
