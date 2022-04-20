import type Debug from "@/controllers/globalControllers/Debug";
import { type ColorRepresentation, Fog, type Scene, type Vector3 } from "three";
import type { FolderApi } from "tweakpane";
import Experience from "../Experience";
export default class SceneFog {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;

  private color: ColorRepresentation = "#45D7CE";
  private near: number = 15;
  private far: number = 20;
  private instance: Fog | null = null;

  constructor() {
    this.setFog();
    this.setDebug();
  }

  setFog() {
    this.instance = new Fog(this.color, this.near, this.far);
    if (this.scene) {
      this.scene.fog = this.instance;
    }
  }
  update() {
    if (this.experience.camera?.instance && this.instance) {
      const dist = this.experience.camera?.instance?.position.distanceTo(
        this.experience.camera.controls?.target as Vector3
      );
      this.instance.far = dist;
      this.instance.near = dist - 1;
    }
  }
  setDebug() {
    if (this.debug?.active) {
      if (this.scene) {
        if (this.debug.ui)
          this.debugFolder = this.debug.ui.addFolder({ title: "Fog" });
        if (this.scene.fog) {
          const showFogButton = this.debugFolder?.addButton({
            title: "Toggle Fog",
          });
          showFogButton?.on("click", () => {
            if (!this.scene.fog) {
              this.setFog();
            } else {
              this.scene.fog = null;
            }
          });
        }
      }
    }
  }
}
