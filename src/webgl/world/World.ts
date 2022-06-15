import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { AxesHelper, type Scene } from "three";
import type { FolderApi } from "tweakpane";
import type { district } from "./../../models/district.model";
import Earth from "./earthScene/Earth";
import type Renderer from "../Renderer";
import HomeScene from "./homeScene/HomeScene";
import CityScene from "./cityScene/CityScene";
import type Camera from "./Camera";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GrandmaScene from "./grandmaScene/grandmaScene";
// import type Ashes from "./entities/Ashes/Ashes";
import signal from 'signal-js';
import type Loaders from "../controllers/Loaders/Loaders";
import Intro from "./homeScene/Intro/Intro";
import Outro from "./earthScene/Outro/Outro";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private renderer: Renderer = this.experience.renderer as Renderer;
  private canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  public earthScene: Earth | null = null;
  public homeScene: HomeScene | null = null;
  public cityScene: CityScene | null = null;
  public grandmaScene: GrandmaScene | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debugTab2: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public currentScene: district = "earth";
  public controls: OrbitControls | null = null;
  public PARAMS = {
    "isMaintenanceOn": false,
    "isCtrlActive": true
  }
  private intro: Intro | null = null;
  private outro: Outro | null = null;

  constructor() {
    signal.on("loaders_ready", () => {
      this.earthScene = new Earth();
      this.homeScene = new HomeScene();
      this.cityScene = new CityScene();
      this.grandmaScene = new GrandmaScene();

      const workOn = import.meta.env.VITE_WORK_ON || "home";
      switch (workOn) {
        case "earth":
          this.experience.activeScene = this.earthScene.scene;
          this.experience.activeCamera = this.earthScene.camera;
          break;
        case "home":
          this.experience.activeScene = this.homeScene.scene;
          this.experience.activeCamera = this.homeScene.camera;
          break;
        case "grandma":
          this.experience.activeScene = this.grandmaScene.scene;
          this.experience.activeCamera = this.grandmaScene.camera;
          break;
        case "city":
          this.experience.activeScene = this.cityScene.scene;
          this.experience.activeCamera = this.cityScene.camera;
          break;
        default:
          this.experience.activeScene = this.earthScene.scene;
          this.experience.activeCamera = this.earthScene.camera;
          break;
      }

      signal.on("change_scene", (name: district) => {
        this.changeScene(name);
      })

      // this.setAxis();
      this.setIntro();
      this.setOutro();
      this.setDebug();
    });
  }

  setAxis() {
    const axesHelper = new AxesHelper(1);
    this.experience.activeScene?.add(axesHelper);
  }

  setIntro() {
    this.intro = new Intro();
  }

  setOutro() {
    this.outro = new Outro();
  }

  update() {
    this.earthScene?.update();
    this.homeScene?.update();
    this.intro?.update();
    this.outro?.update();
    if (this.PARAMS.isCtrlActive) this.controls?.update();
  }

  setControls() {
    if (this.experience.activeCamera?.instance && this.canvas) {
      this.controls = new OrbitControls(this.experience.activeCamera.instance, this.canvas);
      this.controls.enableDamping = true;
      this.controls.enableZoom = true;
      this.controls.enablePan = false;
      this.setListener();
    }
  }

  setListener() {
    this.controls?.addEventListener("change", () => {
      this.earthScene?.updateRelatedToCamera();
    });
  }

  changeScene(name: district) {
    this.currentScene = name;
    let delay = 0;
    const changeMaintenance = this.PARAMS.isMaintenanceOn;
    if (changeMaintenance) {
      this.unsetMaintenance();
      delay = 1000;
    }
    setTimeout(() => {
      switch (name) {
        case "earth":
          this.experience.renderer?.changeScene(this.earthScene?.scene as Scene, this.earthScene?.camera as Camera);
          break;
        case "maison":
          this.experience.renderer?.changeScene(this.homeScene?.scene as Scene, this.homeScene?.camera as Camera);
          break;
        case "ville":
          this.experience.renderer?.changeScene(this.cityScene?.scene as Scene, this.cityScene?.camera as Camera, true);
          break;
        case "mamie":
          this.experience.renderer?.changeScene(this.grandmaScene?.scene as Scene, this.grandmaScene?.camera as Camera, true);
          break;
        default:
          break;
      }
    }, delay);
  }

  setMaintenance() {
    signal.emit("maintenance_on");
    this.PARAMS.isMaintenanceOn = true;
    if (this.controls) {
      this.controls.enableRotate = false;
      this.controls.autoRotate = true;
    }
  }
  
  unsetMaintenance() {
    signal.emit("maintenance_off");
    this.PARAMS.isMaintenanceOn = false;
    if (this.controls) {
      this.controls.enableRotate = true;
      this.controls.autoRotate = false;
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

    if (this.homeScene && this.earthScene) {
      switchHome?.on("click", () => {
        this.currentScene = "maison";
        this.experience.renderer?.changeScene(
          this.homeScene?.scene as Scene,
          this.homeScene?.camera as Camera
        );
      });
      switchCity?.on("click", () => {
        this.currentScene = "ville";
        this.experience.renderer?.changeScene(
          this.cityScene?.scene as Scene,
          this.cityScene?.camera as Camera,
          true
        );
      });
      switchEarth?.on("click", () => {
        this.currentScene = "earth";
        this.experience.renderer?.changeScene(
          this.earthScene?.scene as Scene,
          this.earthScene?.camera as Camera
        );
      });
      switchGrandma?.on("click", () => {
        this.currentScene = "mamie";
        this.experience.renderer?.changeScene(
          this.grandmaScene?.scene as Scene,
          this.grandmaScene?.camera as Camera,
          true
        );
      });
    }

    this.debugTab2 = this.debug.ui?.pages[0].addFolder({
      title: "Maintenance mode",
    });
    const switchMaintenance = this.debugTab2?.addInput(this.PARAMS, "isMaintenanceOn", { label: "Toggle" });
    switchMaintenance?.on("change", () => {
      if (this.PARAMS.isMaintenanceOn) {
        this.setMaintenance();
      } else {
        this.unsetMaintenance();
      }
    });
  }
}
