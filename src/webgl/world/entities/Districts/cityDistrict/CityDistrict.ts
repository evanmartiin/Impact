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

export default class CityDistrict {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  public instance: Group = new Group();
  private character: Character = new Character();
  private isInit = false;
  private isDisplayed = false;
  public trash: Trash | null = null;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;

  static isPlaying: boolean = false;
  static score: number = 0;
  static startTime: number = 0;
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
    this.trash = new Trash();
    console.log(this.trash);
    
    this.scene.add(Waste.wasteMeshes);
    CityDistrict.score = 0;
    CityDistrict.startTime = this.time.elapsed;
    CityDistrict.isPlaying = true;
  }

  stopGame() {
    CityDistrict.isPlaying = false;
    console.log('Ended, score:', CityDistrict.score);

    this.trash?.destroy();
    this.trash = null;
    Waste.destroy();

    this.scene.remove(Waste.wasteMeshes);
  }

  increaseScore() {
    CityDistrict.score++;
    console.log('Score:', CityDistrict.score);
  }

  update() {
    if (CityDistrict.isPlaying) {
      if (this.time.elapsed - CityDistrict.startTime >= CityDistrict.MAX_TIME) {
        this.stopGame();
      } else if (this.time.elapsed - Waste.lastSpawn > Waste.SPAWN_COOLDOWN) {
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
      this.character.appear();
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
      this.character.disappear();
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
