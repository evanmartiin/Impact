import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import {
  Color,
  DataTexture,
  LuminanceFormat,
  MeshToonMaterial,
  RedFormat,
} from "three";
import type { FolderApi } from "tweakpane";

export default class TreeMaterial {
  static instance: TreeMaterial;

  public material: MeshToonMaterial | null = null;

  private experience: Experience = new Experience();
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;

  constructor() {
    if (TreeMaterial.instance) {
      return TreeMaterial.instance;
    }
    TreeMaterial.instance = this;

    this.setMaterial();

    this.setDebug();
  }

  setMaterial() {
    const format = this.experience.renderer?.instance
      ? this.experience.renderer.instance.capabilities.isWebGL2
        ? RedFormat
        : LuminanceFormat
      : undefined;
    const tonesStep = 4;

    const colors = new Uint8Array(tonesStep);
    for (let c = 0; c <= colors.length; c++) {
      colors[c] = (c / colors.length) * 256;
    }

    const gradientMap = new DataTexture(colors, colors.length, 1, format);
    gradientMap.needsUpdate = true;

    this.material = new MeshToonMaterial({
      color: new Color(0.16, 0.47, 0.12),
      gradientMap: gradientMap,
    });
  }

  setDebug() {
    if (this.debug.active) {
      if (this.material?.color) {
        this.debugFolder = this.debug.ui?.addFolder({ title: "TreeMaterial" });

        this.debugFolder?.addInput(this.material.color, "r", {
          min: 0,
          max: 1,
          step: 0.01,
        });
        this.debugFolder?.addInput(this.material.color, "g", {
          min: 0,
          max: 1,
          step: 0.01,
        });
        this.debugFolder?.addInput(this.material.color, "b", {
          min: 0,
          max: 1,
          step: 0.01,
        });
      }
    }
  }

  destroy() {
    this.debugFolder?.dispose();
    this.material?.dispose();
  }
}
