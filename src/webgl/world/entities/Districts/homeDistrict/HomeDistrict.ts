import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group, PerspectiveCamera } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi, ButtonApi } from "tweakpane";
import SeedGameBoard from "./SeedGame/SeedGameBoard";

export default class HomeDistrict {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private camera: PerspectiveCamera = this.experience.camera
    ?.instance as PerspectiveCamera;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public instance: Group = new Group();
  private isInit = false;
  private isDisplayed = false;
  private startButton: ButtonApi | null = null;
  private stopButton: ButtonApi | null = null;
  public game: SeedGameBoard | null = null;

  constructor() {}

  init() {
    this.game = new SeedGameBoard();
    const districtModel = this.loaders.items["housev1"] as GLTF;
    this.instance.add(districtModel.scene);
    const scale = 0.2;
    this.instance.position.set(0, -20, 0);
    this.instance.scale.set(scale, scale, scale);
    this.instance.visible = false;
    this.isInit = true;
    this.appear();
  }

  appear() {
    if (!this.isInit) {
      this.init();
    } else if (!this.isDisplayed) {
      const tl = anime.timeline({});
      tl.add({
        begin: () => {
          this.instance.visible = true;
        },
        targets: this.instance?.position,
        y: -0.2,
        easing: "easeInOutQuart",
        duration: 1000,
      });
      this.setDebug();
      this.isDisplayed = true;
      // this.character.appear();
    }
  }

  update() {
    if (this.game) this.game.update();
  }

  disappear() {
    if (this.isDisplayed) {
      const tl = anime.timeline({});
      tl.add({
        targets: this.instance?.position,
        y: [-0.2, -20],
        easing: "easeInOutQuart",
        duration: 1000,
        complete: () => {
          this.instance.visible = false;
        },
      });
      // this.character.disappear();
      if (this.debugFolder) this.debug.ui?.remove(this.debugFolder);
      if (this.game) this.game.disappear();
      this.isDisplayed = false;
    }
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
    this.debugFolder = this.debug.ui?.addFolder({ title: "Home" });
    if (this.instance?.position) {
      this.debugFolder?.addInput(this.camera?.position, "x", {
        min: -10,
        max: 10,
        step: 0.1,
      });
      this.debugFolder?.addInput(this.camera?.position, "y", {
        min: -10,
        max: 10,
        step: 0.01,
      });
      this.debugFolder?.addInput(this.camera?.position, "z", {
        min: -10,
        max: 10,
        step: 0.01,
      });
    }
    this.startButton = this.debugFolder?.addButton({
      title: "Enter Game",
    }) as ButtonApi;
    this.startButton?.on("click", () => {
      this.enterGameView();
    });

    this.stopButton = this.debugFolder?.addButton({
      title: "Leave Game",
    }) as ButtonApi;
    this.stopButton?.on("click", () => {
      this.leaveGameView();
      if (this.game) this.game.camdebuging = false;
    });
  }
}
