import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import { DirectionalLight, type Scene, type Vector3 } from "three";
import type { FolderApi } from "tweakpane";
import type { district } from "./../../models/district.model";
import Earth from "./earthScene/Earth";
import Character from "./homeScene/Character/Character";
import type Renderer from "../Renderer";
import HomeDistrict from "./homeScene/HomeDistrict";
import CityDistrict from "./cityScene/CityDistrict";
import type Camera from "./Camera";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private renderer: Renderer = this.experience.renderer as Renderer;
  private canvas: HTMLCanvasElement = this.experience.canvas as HTMLCanvasElement;
  public earth: Earth | null = null;
  public homeDistrict: HomeDistrict | null = null;
  public cityDistrict: CityDistrict | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public currentScene: district = "earth";
  public controls: OrbitControls | null = null;

  constructor() {
    this.loaders.on("ready", () => {
      this.earth = new Earth();
      this.homeDistrict = new HomeDistrict();
      this.cityDistrict = new CityDistrict();

      this.experience.activeScene = this.earth.scene;
      this.experience.activeCamera = this.earth.camera;

      this.setLight();
      this.setControls();
      this.setDebug();
    });
  }

  update() {
    this.earth?.update();
    this.homeDistrict?.update();
    this.controls?.update();
  }

  setControls() {
    if (this.experience.activeCamera?.instance && this.canvas) {
      this.controls = new OrbitControls(this.experience.activeCamera.instance, this.canvas);
      this.controls.enableDamping = true;
      // this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.setListener();
    }
  }

  setListener() {
    this.controls?.addEventListener("change", () => {
      this.experience.world?.earth?.updateRelatedToCamera();
    })
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

  setDebug() {
    this.debugTab = this.debug.ui?.pages[0].addFolder({ title: "Change scene" });
    const switchHome = this.debugTab?.addButton({ title: "Maison" });
    const switchCity = this.debugTab?.addButton({ title: "Ville" });
    const switchEarth = this.debugTab?.addButton({ title: "Earth" });

    if (this.homeDistrict && this.earth) {
      switchHome?.on("click", () => {
        this.currentScene = "maison";
        this.experience.renderer?.changeScene(this.homeDistrict?.scene as Scene, this.homeDistrict?.camera as Camera);
      });
      switchCity?.on("click", () => {
        this.currentScene = "ville";
        this.experience.renderer?.changeScene(this.cityDistrict?.scene as Scene, this.cityDistrict?.camera as Camera);
      });
      switchEarth?.on("click", () => {
        this.currentScene = "earth";
        this.experience.renderer?.changeScene(this.earth?.scene as Scene, this.earth?.camera as Camera);
      });
    }
  }
}
