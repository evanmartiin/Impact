import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import { DirectionalLight, Mesh, MeshMatcapMaterial, Scene, Texture, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import Character from "@/webgl/world/homeScene/Billy/Billy";
import type Time from "@/webgl/controllers/Time";
import Waste from "./Waste";
import Trash from "./Trash";
import type Debug from "@/webgl/controllers/Debug";
import type { TabPageApi } from "tweakpane";
import Scoreboard from "./Scoreboard";
import Camera from "../Camera";
import signal from 'signal-js';

export default class CityScene {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  private debugPage: TabPageApi | undefined = undefined;

  public scene: Scene = new Scene();
  public cameraPos: Vector3 = new Vector3(50, 50, 50);
  public camera: Camera = new Camera(this.cameraPos, this.scene);
  public scoreboard: Scoreboard = new Scoreboard();
  public trash: Trash | null = null;

  static isPlaying: boolean = false;
  static MAX_TIME: number = 10000;

  constructor() {
    this.setModel();
    this.setLight();
    this.setDebug();
  }

  setModel() {
    const districtModel = this.loaders.items["city"] as GLTF;
    const districtMatcap = this.loaders.items["matcap-texture"] as Texture;
    const districtMaterial = new MeshMatcapMaterial({ matcap: districtMatcap, color: 0x1b5f2f });
    districtModel.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = districtMaterial;
      }
    })
    this.scene.add(districtModel.scene);
  }

  setLight() {
    const sunLight = new DirectionalLight("#ffffff", 4);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(200, 0, 200);
    this.scene.add(sunLight);
  }

  startGame() {
    if (!CityScene.isPlaying) {
      this.trash = new Trash(this.scene);
      this.scene.add(Waste.wasteMeshes);

      this.scoreboard.startTimer(CityScene.MAX_TIME);
      signal.on("timer_ended", () => {
        this.stopGame();
      });

      CityScene.isPlaying = true;
    }
  }

  stopGame() {
    if (CityScene.isPlaying) {
      console.log("Ended, score:", this.scoreboard?.score);
      signal.off("timer_ended");

      this.trash?.destroy();
      this.trash = null;
      Waste.destroy();
      this.scene.remove(Waste.wasteMeshes);

      CityScene.isPlaying = false;
    }
  }

  update() {
    if (CityScene.isPlaying) {
      this.scoreboard?.update();
      if (this.time.elapsed - Waste.lastSpawn > Waste.SPAWN_COOLDOWN) {
        Waste.lastSpawn = this.time.elapsed;
        new Waste();
      }

      Waste.wasteInstances.forEach((wasteInstance) => {
        wasteInstance.update();
      });
    }
  }

  setDebug() {
    if (this.debug?.active) {
      this.debugPage = this.debug.ui?.pages[3];
      const startGameBtn = this.debugPage?.addButton({ title: "Start Game" });
      startGameBtn?.on("click", () => {
        this.startGame();
      });
    }
  }
}
