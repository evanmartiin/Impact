import type Debug from "@/controllers/globalControllers/Debug";
import { AmbientLight, DirectionalLight, Scene } from "three";
import type { FolderApi } from "tweakpane";
import Experience from "@/webgl/Experience";

export default class Environment {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined;
  private sunLight: DirectionalLight | null = null;
  private ambientLight: AmbientLight | null = null;
  private time = 0;

  constructor() {
    this.setAmbientLight();
    this.setSunLight();

    this.setDebug();
  }

  setAmbientLight() {
    this.ambientLight = new AmbientLight("#ffffff");
    this.scene.add(this.ambientLight);
  }

  setSunLight() {
    this.sunLight = new DirectionalLight("#ffffff", 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(20, 0, 20);
    this.scene.add(this.sunLight);

    this.sunRotate();
  }

  sunRotate() {
    this.time += 0.02;
    this.sunLight?.position.set(
      Math.cos(this.time) * 40,
      40,
      Math.sin(this.time) * 40
    );

    window.requestAnimationFrame(() => {
      this.sunRotate();
    });
  }

  setDebug() {
    if (this.debug.active) {
      if (this.sunLight) {
        this.debugFolder = this.debug.ui?.addFolder({ title: "Sun" });

        this.debugFolder?.addInput(this.sunLight, "intensity", {
          min: 0,
          max: 10,
          step: 0.01,
        });
      }
    }
  }
  destroy() {
    this.ambientLight?.dispose();
    this.sunLight?.dispose();
    this.debugFolder?.dispose();
  }
}
