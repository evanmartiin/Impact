import Experience from "@/webgl/Experience";
import type Debug from "@/webgl/controllers/Debug";
import {
  type Scene,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  Group,
  ShaderMaterial,
} from "three";
import type { FolderApi } from "tweakpane";

import fragment from "./shaders/frag.glsl?raw";
import vertex from "./shaders/vert.glsl?raw";

export default class SeedFocus {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  private isDisplayed = false;
  private isInit = false;
  public instance: Group = new Group();
  private distanceCurve: Mesh | null = null;
  private distanceCurveMat: ShaderMaterial | null = null;
  private distanceCurveGeo: PlaneGeometry | null = null;

  constructor() {}

  setDistanceCurve() {
    this.distanceCurveGeo = new PlaneGeometry(1, 1);
    this.distanceCurveMat = new ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        sina: {
          value: 1,
        },
        coef: {
          value: 1,
        },
      },
    });
    this.distanceCurve = new Mesh(this.distanceCurveGeo, this.distanceCurveMat);
    this.distanceCurve.rotation.x = Math.PI / 2;
    const scaleY = 5;
    this.distanceCurve.position.set(0, 1.2, scaleY / 2 + 1.4);
    this.distanceCurve.scale.set(0.4, scaleY, 1);
    this.instance.add(this.distanceCurve);
  }

  init() {
    this.setDistanceCurve();
    this.scene.add(this.instance);
    this.setDebug();
  }

  appear() {
    if (!this.isInit) {
      this.init();
    } else if (this.isDisplayed) {
      this.instance.visible = true;
      this.isDisplayed = true;
    }
  }

  disappear() {
    if (!this.isDisplayed) {
      this.instance.visible = true;
      this.isDisplayed = false;
    }
  }

  update() {}

  setDebug() {
    this.debugFolder = this.debug.ui?.addFolder({ title: "SeedFocus" });
    if (this.instance) {
      this.debugFolder?.addInput(this.instance?.position, "x", {
        min: -5,
        max: 5,
        step: 0.1,
      });
      this.debugFolder?.addInput(this.instance?.position, "y", {
        min: -5,
        max: 5,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.instance?.position, "z", {
        min: -5,
        max: 5,
        step: 0.01,
      });
    }
    if (this.distanceCurve) {
      this.debugFolder?.addInput(this.distanceCurve?.rotation, "x", {
        min: -5,
        max: 5,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.distanceCurve?.rotation, "y", {
        min: -5,
        max: 5,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.distanceCurve?.rotation, "z", {
        min: -5,
        max: 5,
        step: 0.01,
      });

      this.debugFolder?.addInput(this.distanceCurve?.scale, "x", {
        min: -5,
        max: 5,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.distanceCurve?.scale, "y", {
        min: -5,
        max: 5,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.distanceCurve?.scale, "z", {
        min: -5,
        max: 5,
        step: 0.01,
      });
    }
  }
  destroy() {
    this.instance.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        for (const key in child.material) {
          const value = child.material[key];
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });
  }
}
