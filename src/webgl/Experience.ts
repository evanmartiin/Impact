import Debug from "@/webgl/controllers/Debug";
import Loaders from "@/webgl/controllers/Loaders/Loaders";
import Sources from "@/webgl/controllers/Loaders/Scenes/Scenes.sources";
import SoundSources from "@/webgl/controllers/Sound/sources";
import Mouse from "@/webgl/controllers/Mouse";
import Sizes from "@/webgl/controllers/Sizes";
import Time from "@/webgl/controllers/Time";
import type { ISource } from "@/models/webgl/source.model";
import { AxesHelper, Mesh, Scene } from "three";
import Renderer from "./Renderer";
import World from "./world/World";
import type Camera from "./world/Camera";
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import signal from "signal-js";
import Sound from "./controllers/Sound/Sound";
import type { SoundSource } from "@/models/webgl/sound.model";

declare global {
  interface Window {
    experience: Experience;
  }
}

export default class Experience {
  static instance: Experience;

  public canvas: HTMLCanvasElement | null = null;
  public debug: Debug | null = null;
  public sizes: Sizes | null = null;
  public mouse: Mouse | null = null;
  public time: Time | null = null;
  public sound: Sound | null = null;
  public activeScene: Scene | null = null;
  public activeCamera: Camera | null = null;
  public loaders: Loaders | null = null;
  public renderer: Renderer | null = null;

  private sources: ISource[] | null = null;
  private soundSources: SoundSource[] | null = null;
  public world: World | null = null;

  constructor(_canvas?: HTMLCanvasElement) {
    if (Experience.instance) {
      return Experience.instance;
    }
    Experience.instance = this;

    // Global access
    window.experience = this;

    // Options
    if (_canvas) this.canvas = _canvas;
    this.sources = Sources();
    this.soundSources = SoundSources;
    this.loaders = new Loaders(this.sources);
    this.sound = new Sound(this.soundSources);
    this.sizes = new Sizes();
    this.mouse = new Mouse();
    this.time = new Time();
    this.debug = new Debug();
    this.world = new World();
    this.renderer = new Renderer();

    // Resize event
    signal.on("resize", () => {
      this.resize();
    });

    // Time tick event
    signal.on("tick", () => {
      this.update();
    });

    this.sizes.setViewSizeAtDepth();
    // this.setAxis();
  }

  resize() {
    this.activeCamera?.resize();
    this.renderer?.resize();
  }

  update() {
    // if (this.time) this.animationController?.update(this.time?.delta);
    this.world?.update();
    this.renderer?.update();
    this.debug?.update();
    ShaderBaseMaterial.globalShaderUniforms.uTime.value = this.time?.elapsed;
  }

  destroy() {
    signal.off("resize");
    signal.off("tick");
    this.mouse?.destroy();
    // Traverse the whole scene
    this.activeScene?.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof Mesh) {
        child.geometry.dispose();

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });
    // this.world?.destroy();
    this.world?.controls?.dispose();
    this.renderer?.instance?.dispose();

    if (this.debug?.active) this.debug.ui?.dispose();
  }
}
