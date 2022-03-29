import type { district } from './../../models/district.model';
import type Debug from "@/controllers/globalControllers/Debug";
import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type { FolderApi } from "tweakpane";
import Districts from "./entities/Districts/Districts";
import Earth from "./entities/Earth/Earth";
import Environment from "./Environment";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected environment: Environment | null = null;
  public earth: Earth | null = null;
  public districts: Districts | null = null;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public currentScene: district = "earth";

  constructor() {
    this.loaders.on("ready", () => {
      this.environment = new Environment();
      this.earth = new Earth();
      this.districts = new Districts();
      this.setDebug();
    });
  }

  update() {
    this.earth?.update();
    this.environment?.update();
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.addFolder({ title: "District" });

    const switchDistricts = this.debugFolder?.addButton({
      title: "District1",
    });
    if (this.districts?.district1 && this.earth) {
      switchDistricts?.on("click", () => {
        this.earth?.disappear();
        this.districts?.switchDistrict("district1");
        this.currentScene = "district1";
      });
    }

    const switchEarth = this.debugFolder?.addButton({
      title: "Earth",
    });
    if (this.districts?.district1 && this.earth) {
      switchEarth?.on("click", () => {
        this.earth?.appear();
        this.districts?.switchDistrict("earth");
        this.currentScene = "earth";
      });
    }
  }

  destroy() {
    this.environment?.destroy();
    this.earth?.destroy();
  }
}
