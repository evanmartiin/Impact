import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type { Scene } from "three";
import type { FolderApi } from "tweakpane";
import type { district } from "./../../models/district.model";
import Earth from "./earthScene/Earth";
import Character from "./homeScene/Character/Character";
import type Renderer from "../Renderer";
import HomeDistrict from "./homeScene/HomeDistrict";
import CityDistrict from "./cityScene/CityDistrict";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private renderer: Renderer = this.experience.renderer as Renderer;
  public earth: Earth | null = null;
  public homeDistrict: HomeDistrict | null = null;
  public cityDistrict: CityDistrict | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public currentScene: district = "earth";

  constructor() {
    this.loaders.on("ready", () => {
      this.earth = new Earth();
      this.homeDistrict = new HomeDistrict();
      this.cityDistrict = new CityDistrict();

      this.experience.activeScene = this.earth.scene;

      this.setDebug();
    });
  }

  update() {
    this.earth?.update();
    this.homeDistrict?.update();
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[0].addFolder({ title: "Change scene" });
    const switchHome = this.debugTab?.addButton({ title: "Maison" });
    const switchCity = this.debugTab?.addButton({ title: "Ville" });
    const switchEarth = this.debugTab?.addButton({ title: "Earth" });

    if (this.homeDistrict && this.earth) {
      switchHome?.on("click", () => {
        this.currentScene = "maison";
        this.experience.activeScene = this.homeDistrict?.scene as Scene;
      });
      switchCity?.on("click", () => {
        this.currentScene = "ville";
        this.experience.activeScene = this.cityDistrict?.scene as Scene;
      });
      switchEarth?.on("click", () => {
        this.currentScene = "earth";
        // this.districts?.disableMovements();
        this.experience.activeScene = this.earth?.scene as Scene;
      });
    }
  }
}
