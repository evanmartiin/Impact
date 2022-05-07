import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { AmbientLight, DirectionalLight, Scene } from "three";
import type { FolderApi } from "tweakpane";
import SceneFog from "./SceneFog";

export default class Environment {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private sunLight: DirectionalLight | null = null;
  private ambientLight: AmbientLight | null = null;
  private time = 0;
  private fog: SceneFog | null;

  constructor() {
    this.fog = new SceneFog();

    this.setAmbientLight();
    this.setSunLight();
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
    this.sunLight.position.set(200, 0, 200);
    this.scene.add(this.sunLight);
  }

  update() {
    // this.fog?.update();
    // if (this.experience.camera?.instance) {
    //   this.sunLight?.position.copy(this.experience.camera?.instance?.position);
    // }
  }

  destroy() {
    this.ambientLight?.dispose();
    this.sunLight?.dispose();
    this.debugFolder?.dispose();
  }
}
