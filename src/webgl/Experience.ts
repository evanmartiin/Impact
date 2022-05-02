import Debug from "@/webgl/controllers/Debug";
import AnimationController from "@/webgl/controllers/AnimationController";
import Loaders from "@/webgl/controllers/Loaders/Loaders";
import Sources from "@/webgl/controllers/Loaders/sources";
import Mouse from "@/webgl/controllers/Mouse";
import Sizes from "@/webgl/controllers/Sizes";
import Time from "@/webgl/controllers/Time";
import type { ISource } from "@/models/webgl/source.model";
import { AxesHelper, Mesh, Scene } from "three";
import Renderer from "./Renderer";
import Camera from "./world/Camera";
import World from "./world/World";

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
  public scene: Scene | null = null;
  public loaders: Loaders | null = null;
  public camera: Camera | null = null;
  public renderer: Renderer | null = null;
  public animationController: AnimationController | null = null;

  private sources: ISource[] | null = null;
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
    this.sources = Sources;
    this.loaders = new Loaders(this.sources);
    this.sizes = new Sizes();
    this.mouse = new Mouse();
    this.time = new Time();
    this.debug = new Debug();
    this.scene = new Scene();
    this.camera = new Camera();
    this.animationController = new AnimationController();
    this.world = new World();
    this.renderer = new Renderer();

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    this.sizes.setViewSizeAtDepth();
    // this.setAxis();
  }

  setAxis() {
    const axesHelper = new AxesHelper(3);

    this.scene?.add(axesHelper);
  }

  resize() {
    this.camera?.resize();
    this.renderer?.resize();
  }

  update() {
    if (this.time) this.animationController?.update(this.time?.delta);
    this.camera?.update();
    this.world?.update();
    this.renderer?.update();
    this.debug?.update();
  }

  destroy() {
    this.sizes?.off("resize");
    this.time?.off("tick");
    this.mouse?.destroy();
    // Traverse the whole scene
    this.scene?.traverse((child) => {
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
    this.world?.destroy();
    this.camera?.controls?.dispose();
    this.renderer?.instance?.dispose();

    if (this.debug?.active) this.debug.ui?.dispose();
  }
}
