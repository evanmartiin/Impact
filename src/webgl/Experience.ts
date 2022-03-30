import Debug from "@/controllers/globalControllers/Debug";
import Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import Sources from "@/controllers/webglControllers/Loaders/sources";
import Sizes from "@/controllers/webglControllers/Sizes";
import Time from "@/controllers/webglControllers/Time";
import type { ISource } from "@/models/webgl/source.model";
import { AxesHelper, Fog, Mesh, Scene } from "three";
import type { FolderApi } from "tweakpane";
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
  public time: Time | null = null;
  public scene: Scene | null = null;
  public loaders: Loaders | null = null;
  public camera: Camera | null = null;
  public renderer: Renderer | null = null;

  private sources: ISource[] | null = null;
  private world: World | null = null;
  private debugFolder: FolderApi | null = null;

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
    this.time = new Time();
    this.debug = new Debug();
    this.scene = new Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    this.setAxis();

    this.setSceneFog();
    this.setDebug();
  }

  setAxis() {
    const axesHelper = new AxesHelper(5);
    this.scene?.add(axesHelper);
  }

  resize() {
    this.camera?.resize();
    this.renderer?.resize();
  }

  update() {
    this.camera?.update();
    // this.world?.update()
    this.renderer?.update();
    this.debug?.update();
  }

  destroy() {
    this.sizes?.off("resize");
    this.time?.off("tick");
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

  setSceneFog() {
    if (this.scene) {
      this.scene.fog = new Fog(0x000000, 12, 16);
    }
  }

  setDebug() {
    if (this.debug?.active) {
      if (this.scene) {
        if (this.debug.ui)
          this.debugFolder = this.debug.ui.addFolder({ title: "Fog" });
        if (this.scene.fog) {
          this.debugFolder?.addInput(this.scene.fog, "color");
          this.debugFolder?.addInput(this.scene.fog as Fog, "near", {
            min: 0,
            max: 20,
            step: 1,
          });
          this.debugFolder?.addInput(this.scene.fog as Fog, "far", {
            min: 0,
            max: 50,
            step: 1,
          });
        }
      }
    }
  }
}
