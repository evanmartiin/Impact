import anime from "animejs";
import { GameCamCtrl } from "./Controllers/GameCam/GameCamCtrl";
import type Camera from "@/webgl/world/Camera";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import type Mouse from "@/webgl/controllers/Mouse";
import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Group, PerspectiveCamera, Vector3, type Scene } from "three";
import type { FolderApi, ButtonApi } from "tweakpane";
import Seed from "./Seed/Seed";
import type Renderer from "@/webgl/Renderer";
import Helper from "./Helper/Helper";
import signal from "signal-js";
import Lumberjack from "./Lumberjack/Lumberjack";
import physicSettings from "./Controllers/Physic/PhysicSettings";
import type Time from "@/webgl/controllers/Time";
import FollowGameCam from "./FollowCam/FollowGameCam";
import seedSettings from "./Seed/SeedSettings";
import seedGameSettings from "./SeedGameSettings";
import type Tree from "./Tree/Tree";

export default class SeedGame {
  static instance: SeedGame;

  public trees: Tree[] = [];
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private scene: Scene | null = null;
  private renderer: Renderer = this.experience.renderer as Renderer;
  private camera: Camera | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public instance: Group = new Group();
  private prevCamPos = new Vector3(0, 0, 0);
  private helper: Helper | null = null;
  private angleTarget = new Vector3();
  private lumberjack: Lumberjack[] = [];
  private followCameraGroup: FollowGameCam | null = null;

  private distanceLookAt = -30;
  private cameraHeight = 0.5;
  private heightLookAt = 0;

  private defaultCenterPos = new Vector3(
    this.distanceLookAt,
    this.heightLookAt,
    0
  );

  private isInit = false;
  private isSet = false;
  private isStarted = false;
  public isGameView = false;

  private seed: Seed | null = null;
  private targetPoint: Vector3 | null = null;
  private cameraLookAtPoint: Vector3 | null = null;

  private shotAngle = 0;

  private gameControls: PointerLockControls | null = null;

  private lastSpawnTime = 0;

  constructor(scene?: Scene, camera?: Camera) {
    if (SeedGame.instance) {
      return SeedGame.instance;
    }
    SeedGame.instance = this;

    this.scene = scene as Scene;
    this.camera = camera as Camera;

    this.gameControls = new PointerLockControls(
      camera?.instance as PerspectiveCamera,
      this.renderer.canvas
    );
    signal.on("game:launch", this.enterGameView.bind(this));
  }

  private gameCamCtrl: GameCamCtrl | null = null;

  init() {
    this.isInit = true;
    this.seed = new Seed(this.scene as Scene);
    this.targetPoint = new Vector3();
    this.cameraLookAtPoint = new Vector3();
    this.scene?.add(this.instance);
    this.set();
    this.setDebug();
    this.helper = new Helper(this.scene as Scene);
    if (this.camera) this.gameCamCtrl = new GameCamCtrl(this.camera);
  }

  update() {
    if (this.isGameView) {
      if (this.helper?.instance)
        this.helper.instance.position.set(0, this.cameraHeight, 0.01);
      this.seed?.update();
    }

    const physicsSteps = physicSettings.physicsSteps;
    for (let i = 0; i < physicsSteps; i++) {
      this.lumberjack?.map((l) => {
        l.update((this.time.delta / physicsSteps) * 0.0001);
      });
    }

    if (this.isStarted) {
      this.gameLoop();
    }
  }

  gameLoop() {
    // SPAWN Lumberjack
    if (
      this.time.elapsed * 0.001 - this.lastSpawnTime * 0.001 >
      seedGameSettings.deltaLumberjackSpawn
    ) {
      this.setLumberjack();
      this.lastSpawnTime = this.time.elapsed;
    }
  }

  set() {
    if (!this.isInit) {
      this.init();
    } else if (!this.isSet) {
      this.isSet = true;
      signal.on("mouse_down", () => this.mouseClick());
    }
  }

  mouseClick() {
    if (this.cameraLookAtPoint) {
      this.angleTarget = this.angleTarget.copy(this.cameraLookAtPoint);
    } else {
      this.angleTarget.set(0, 0, 0);
    }
    this.angleTarget.y = this.cameraHeight;
    this.seed?.shot();
  }

  setLumberjack() {
    this.lumberjack.push(
      new Lumberjack(this.scene as Scene, this.camera as Camera)
    );
  }

  unset() {
    if (this.isSet) {
      this.isSet = false;
      // signal.off("mouse_move");
      signal.off("mouse_down");
    }
  }

  setCounter() {
    const counter = document.getElementById("counter") as HTMLElement;
    const targetCursor = document.getElementById("targetCursor") as HTMLElement;
    const tl = anime.timeline({
      easing: "easeOutExpo",
      duration: 750,
    });
    tl.add({
      targets: ".counter",
      display: "block",
      duration: 1000,
      begin: () => {
        signal.emit("set_counter_number", "3");
        counter.style.display = "block";
        targetCursor.style.opacity = "0";
      },
    });
    tl.add({
      duration: 1000,
      begin: () => {
        signal.emit("set_counter_number", "2");
      },
    });
    tl.add({
      duration: 1000,
      begin: () => {
        signal.emit("set_counter_number", "1");
      },
    });
    tl.add({
      duration: 1000,
      begin: () => {
        signal.emit("set_counter_number", "GO");
        this.start();
      },
      complete: () => {
        counter.style.display = "none";
        targetCursor.style.opacity = "1";
      },
    });
  }

  start() {
    if (!this.isStarted) {
      this.setLumberjack();
      this.lastSpawnTime = this.time.elapsed;
      this.isStarted = true;
    }
  }

  stop() {
    if (this.isStarted) {
      this.isStarted = false;
    }
  }

  enterGameView() {
    this.setCounter();
    this.isGameView = true;
    this.set();
    this.gameCamCtrl?.setCamGameMode();
    this.instance.visible = true;
    this.followCameraGroup = new FollowGameCam(this.camera as Camera);
  }

  leaveGameView() {
    this.isGameView = false;
    this.gameCamCtrl?.unsetCamGameMode();
    this.unsetDebug();
    this.instance.visible = false;
    this.followCameraGroup?.hide();
    this.unset();
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[2].addFolder({ title: "Game board" });

    const startButton = this.debugTab?.addButton({
      title: "Start Game",
    }) as ButtonApi;

    // startButton.on("click", () => {
    //   this.start();
    // });

    const stopButton = this.debugTab?.addButton({
      title: "Stop Game",
    }) as ButtonApi;

    // stopButton.on("click", () => {
    //   this.stop();
    // });

    this.debugTab?.addInput(seedSettings, "gravity", {
      min: -10,
      max: 20,
      step: 0.1,
    });

    this.debugTab?.addInput(seedSettings, "speed", {
      min: -10,
      max: 20,
      step: 0.01,
    });

  } 

  unsetDebug() {
    if (this.debugTab) this.debug.ui?.pages[2].remove(this.debugTab);
  }
}
