import type Debug from "@/controllers/globalControllers/Debug";
import { Fog, type ColorRepresentation, type Scene } from "three";
import type { FolderApi } from "tweakpane";
import Experience from "../Experience";

export default class SceneFog {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined;

  private color: ColorRepresentation = 0x000000;
  private near: number = 12;
  private far: number = 16;

  constructor() {
    this.setFog();
    this.setDebug();
  }

  setFog() {
    if (this.scene) {
      this.scene.fog = new Fog(this.color, this.near, this.far);
    }
  }

  setDebug() {
    if (this.debug?.active) {
      if (this.scene) {
        if (this.debug.ui)
          this.debugFolder = this.debug.ui.addFolder({ title: "Fog" });
        if (this.scene.fog) {          
          const showFogButton = this.debugFolder?.addButton({ title: "Toggle Fog" })
          showFogButton?.on('click', () => {
            if (!this.scene.fog) {
              this.setFog()
            } else {
              this.scene.fog = null;
            }
          })

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
