import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import {
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi, ButtonApi } from "tweakpane";
import Camera from "../Camera";
import SeedGame from "./SeedGame/SeedGame";

export default class HomeScene {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public instance: Group = new Group();
  private startButton: ButtonApi | null = null;
  private stopButton: ButtonApi | null = null;
  public game: SeedGame | null = null;
  public scene: Scene = new Scene();
  public cameraPos: Vector3 = new Vector3(50, 50, 50);
  public camera: Camera = new Camera(this.cameraPos);

  constructor() {
    if (this.camera.instance)
      this.game = new SeedGame(this.scene, this.camera);

    const mainModel = this.loaders.items["housev1"] as GLTF;
    this.scene.add(mainModel.scene);

    const sunLight = new DirectionalLight("#ffffff", 4);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(200, 0, 200);
    this.scene.add(sunLight);

    this.setDebug();
    // this.character.appear();
  }

  update() {
    if (this.game) this.game.update();
  }

  enterGameView() {
    if (!this.game?.isGameView) {
      if (this.game) this.game.enterView();
    }
  }

  leaveGameView() {
    if (this.game?.isGameView) {
      if (this.game) this.game.leaveView();
    }
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[2].addFolder({ title: "Home" });
    if (this.scene?.position) {
      this.debugTab?.addInput(this.camera?.instance?.position as Vector3, "x", {
        min: -10,
        max: 10,
        step: 0.1,
      });
      this.debugTab?.addInput(this.camera?.instance?.position as Vector3, "y", {
        min: -10,
        max: 10,
        step: 0.01,
      });
      this.debugTab?.addInput(this.camera?.instance?.position as Vector3, "z", {
        min: -10,
        max: 10,
        step: 0.01,
      });
    }

    this.startButton = this.debugTab?.addButton({
      title: "Enter Game",
    }) as ButtonApi;
    this.startButton?.on("click", () => {
      this.enterGameView();
    });

    this.stopButton = this.debugTab?.addButton({
      title: "Leave Game",
    }) as ButtonApi;
    this.stopButton?.on("click", () => {
      this.leaveGameView();
      if (this.game) this.game.camdebuging = false;
    });
  }
}
