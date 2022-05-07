import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type { Scene } from "three";
import type { FolderApi } from "tweakpane";
import type { district } from "./../../models/district.model";
import Districts from "./entities/Districts/Districts";
import Earth from "./entities/Earth/Earth";
import Character from "./entities/Character/Character";
import Environment from "./Environment";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected environment: Environment | null = null;
  protected scene: Scene = this.experience.scene as Scene;
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
      // this.earth?.disappear();
      // this.districts?.switchDistrict("home");
    });
  }

  update() {
    this.districts?.update();
    this.earth?.update();
    this.environment?.update();
    this.districts?.update();
  }

  changeScene(scene: district) {
    this.earth?.disappear();
    this.districts?.switchDistrict(scene);
    this.currentScene = scene;
    this.districts?.enableMovements();
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.addFolder({ title: "District" });

    const switchHome = this.debugFolder?.addButton({
      title: "Maison",
    });
    if (this.districts && this.earth) {
      switchHome?.on("click", () => {
        this.earth?.disappear();
        this.districts?.switchDistrict("maison");
        this.currentScene = "maison";
      });
    }
    const switchCity = this.debugFolder?.addButton({
      title: "Ville",
    });
    if (this.districts && this.earth) {
      switchCity?.on("click", () => {
        this.earth?.disappear();
        this.districts?.switchDistrict("ville");
        this.currentScene = "ville";
      });
    }

    const switchEarth = this.debugFolder?.addButton({
      title: "Earth",
    });
    if (this.districts && this.earth) {
      switchEarth?.on("click", () => {
        this.earth?.appear();
        this.districts?.switchDistrict("earth");
        this.currentScene = "earth";
        this.districts?.disableMovements();
      });
    }
  }

  destroy() {
    // this.environment?.destroy();
  }
}
