import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { DirectionalLight, type Scene } from "three";
import type { FolderApi } from "tweakpane";
import type { district } from "./../../models/district.model";
import Earth from "./earthScene/Earth";
import HomeScene from "./homeScene/HomeScene";
import CityScene from "./cityScene/CityScene";
import type Camera from "./Camera";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GrandmaDistrict from "./grandmaScene/grandmaDistrict";
import signal from 'signal-js';

export default class World {
  private experience: Experience = new Experience();
  private canvas: HTMLCanvasElement = this.experience.canvas as HTMLCanvasElement;
  public earth: Earth | null = null;
  public homeScene: HomeScene | null = null;
  public cityScene: CityScene | null = null;
  public grandmaDistrict: GrandmaDistrict | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public currentScene: district = "earth";
  public controls: OrbitControls | null = null;
  public isCtrlActive = true;

  constructor() {
    signal.on("loaders_ready", () => {
      this.earth = new Earth();
      this.homeScene = new HomeScene();
      this.cityScene = new CityScene();
      this.grandmaDistrict = new GrandmaDistrict();

      this.experience.activeScene = this.earth.scene;
      this.experience.activeCamera = this.earth.camera;

      signal.on("change_scene", (name: district) => {
        this.changeScene(name);
      })

      this.setLight();
      this.setControls();
      this.setDebug();
    });
  }

  update() {
    this.earth?.update();
    this.homeScene?.update();
    if (this.isCtrlActive) this.controls?.update();
  }

  setControls() {
    if (this.experience.activeCamera?.instance && this.canvas) {
      this.controls = new OrbitControls(this.experience.activeCamera.instance, this.canvas);
      this.controls.enableDamping = true;
      this.controls.enablePan = false;
      this.setListener();
    }
  }

  setListener() {
    this.controls?.addEventListener("change", () => {
      this.experience.world?.earth?.updateRelatedToCamera();
    });
  }

  setLight() {
    const sunLight = new DirectionalLight("#ffffff", 4);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(200, 0, 200);
    this.experience.activeScene?.add(sunLight);
  }

  changeScene(name: district) {
    this.currentScene = name;
    switch (name) {
      case "earth":
        this.experience.renderer?.changeScene(this.earth?.scene as Scene, this.earth?.camera as Camera);
        break;
      case "maison":
        this.experience.renderer?.changeScene(this.homeScene?.scene as Scene, this.homeScene?.camera as Camera);
        break;
      case "ville":
        this.experience.renderer?.changeScene(this.cityScene?.scene as Scene, this.cityScene?.camera as Camera);
        break;
      case "mamie":
        this.experience.renderer?.changeScene(this.grandmaDistrict?.scene as Scene, this.grandmaDistrict?.camera as Camera);
        break;
      default:
        break;
    }
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[0].addFolder({
      title: "Change scene",
    });
    const switchHome = this.debugTab?.addButton({ title: "House" });
    const switchCity = this.debugTab?.addButton({ title: "City" });
    const switchEarth = this.debugTab?.addButton({ title: "Earth" });
    const switchGrandma = this.debugTab?.addButton({ title: "Grandma" });

    if (this.homeScene && this.earth) {
      switchHome?.on("click", () => this.changeScene("maison"));
      switchCity?.on("click", () => this.changeScene("ville"));
      switchEarth?.on("click", () => this.changeScene("earth"));
      switchGrandma?.on("click", () => this.changeScene("mamie"));
    }
  }
}
