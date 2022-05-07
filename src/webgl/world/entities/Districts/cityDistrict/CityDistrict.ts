import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group, Scene } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import Character from "@/webgl/world/entities/Character/Character";
import type Time from "@/webgl/controllers/Time";
import Waste from "./Waste";
import Trash from "./Trash";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type Scoreboard from "../homeDistrict/SeedGame/Scoreboard";

export default class CityDistrict {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private scoreboard: Scoreboard = this.experience.world?.districts?.scoreboard as Scoreboard;
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  public instance: Group = new Group();
  private isInit = false;
  private isDisplayed = false;
  public trash: Trash | null = null;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;

  static isPlaying: boolean = false;
  static MAX_TIME: number = 10000;

  constructor() {
    this.init();
    this.setDebug();
  }

  init() {
    const districtModel = this.loaders.items["city"] as GLTF;
    this.instance.add(districtModel.scene);
    const scale = 0.2;
    this.instance.position.set(0, -20, 0);
    this.instance.scale.set(scale, scale, scale);
    this.instance.visible = false;
    this.isInit = true;
  }

  startGame() {
    if (!CityDistrict.isPlaying) {
      this.trash = new Trash();
      this.scene.add(Waste.wasteMeshes);
  
      if (!this.scoreboard) this.scoreboard = this.experience.world?.districts?.scoreboard as Scoreboard;
      this.scoreboard.startTimer(CityDistrict.MAX_TIME);
      this.scoreboard.on("timer_ended", () => {
        this.stopGame();
      });
  
      CityDistrict.isPlaying = true;
    }
  }

  stopGame() {
    if (CityDistrict.isPlaying) {
      console.log('Ended, score:', this.scoreboard?.score);
      this.scoreboard?.off("timer_ended");
  
      this.trash?.destroy();
      this.trash = null;
      Waste.destroy();
      this.scene.remove(Waste.wasteMeshes);
  
      CityDistrict.isPlaying = false;
    }
  }

  update() {
    if (CityDistrict.isPlaying) {
      this.scoreboard?.update();
      if (this.time.elapsed - Waste.lastSpawn > Waste.SPAWN_COOLDOWN) {
        Waste.lastSpawn = this.time.elapsed;
        new Waste();
      };
  
      Waste.wasteInstances.forEach((wasteInstance) => {
        wasteInstance.update();
      })
    }
  }

  appear() {
    if (!this.isDisplayed) {
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
    }
  }

  disappear() {
    if (!this.isDisplayed) {
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
    }
  }
  
  setDebug() {
    if (this.debug?.active) {
      if (this.scene) {
        if (this.debug.ui)
          this.debugFolder = this.debug.ui.addFolder({ title: "CityDistrict" });
          const startGameBtn = this.debugFolder?.addButton({
            title: "Start Game",
          });
          startGameBtn?.on("click", () => {
            this.startGame();
          });
      }
    }
  }
}
