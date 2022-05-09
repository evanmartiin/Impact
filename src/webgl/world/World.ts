import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type { Scene, Vector3 } from "three";
import type { FolderApi } from "tweakpane";
import type { district } from "./../../models/district.model";
import Earth from "./earthScene/Earth";
import Character from "./homeScene/Character/Character";
import type Renderer from "../Renderer";
import HomeScene from "./homeScene/HomeScene";
import CityScene from "./cityScene/CityScene";
import type Camera from "./Camera";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private renderer: Renderer = this.experience.renderer as Renderer;
  public earth: Earth | null = null;
  public homeScene: HomeScene | null = null;
  public cityScene: CityScene | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public currentScene: district = "earth";

  constructor() {
    this.loaders.on("ready", () => {
      this.earth = new Earth();
      this.homeScene = new HomeScene();
      this.cityScene = new CityScene();

      this.experience.activeScene = this.homeScene.scene;
      this.experience.activeCamera = this.homeScene.camera;

      this.setDebug();
    });
  }

  update() {
    this.earth?.update();
    this.homeScene?.update();
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[0].addFolder({ title: "Change scene" });
    const switchHome = this.debugTab?.addButton({ title: "House" });
    const switchCity = this.debugTab?.addButton({ title: "City" });
    const switchEarth = this.debugTab?.addButton({ title: "Earth" });

    if (this.homeScene && this.earth) {
      switchHome?.on("click", () => {
        this.currentScene = "house";
        this.experience.renderer?.changeScene(this.homeScene?.scene as Scene, this.homeScene?.camera as Camera);
      });
      switchCity?.on("click", () => {
        this.currentScene = "city";
        this.experience.renderer?.changeScene(this.cityScene?.scene as Scene, this.cityScene?.camera as Camera);
      });
      switchEarth?.on("click", () => {
        this.currentScene = "earth";
        this.experience.renderer?.changeScene(this.earth?.scene as Scene, this.earth?.camera as Camera);
      });
    }
  }
}
