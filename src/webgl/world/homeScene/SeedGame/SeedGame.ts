import { GameCamCtrl } from "./Controllers/GameCamCtrl";
import type Camera from "@/webgl/world/Camera";
import { isLocked, setLockMouseMode } from "@/utils/lockMouseMode";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import type Mouse from "@/webgl/controllers/Mouse";
import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Group, PerspectiveCamera, Vector3, Euler, type Scene } from "three";
import type { FolderApi, ButtonApi } from "tweakpane";
import Targets from "./Targets/Targets";
import Seed from "./Seed/Seed";
import type Renderer from "@/webgl/Renderer";
import Helper from "./Helper/Helper";
import signal from 'signal-js';

export default class SeedGame {
  private experience: Experience = new Experience();
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

  public targets: Targets | null = null;

  private seed: Seed | null = null;

  private targetPoint: Vector3 | null = null;
  private cameraLookAtPoint: Vector3 | null = null;

  private shotAngle = 0;

  private gameControls: PointerLockControls | null = null;

  constructor(scene: Scene, camera: Camera) {
    this.gameControls = new PointerLockControls(
      camera.instance as PerspectiveCamera,
      this.renderer.canvas
    );
    this.scene = scene;
    this.camera = camera;
  }

  private gameCamCtrl: GameCamCtrl | null = null;

  init() {
    this.isInit = true;
    this.setTargets();
    this.seed = new Seed(this.scene as Scene);
    this.targetPoint = new Vector3();
    this.cameraLookAtPoint = new Vector3();
    this.scene?.add(this.instance);
    this.set();
    this.setDebug();
    this.helper = new Helper(this.scene as Scene);
    if (this.camera) this.gameCamCtrl = new GameCamCtrl(this.camera);
  }

  setTargets() {
    this.targets = new Targets();
    this.targets.setMesh();
    if (this.targets.instance) this.instance.add(this.targets.instance);
  }

  update() {
    if (this.isGameView) {
      if (this.helper?.instance)
        this.helper.instance.position.set(0, this.cameraHeight, 0.01);
      this.seed?.update();
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
    this.seed?.shot(
      this.angleTarget.x,
      this.getShotAngle(this.angleTarget),
      this.distanceLookAt
    );
  }

  radiansToDegrees(radians: number) {
    var pi = Math.PI;
    return radians * (180 / pi);
  }

  getIntersects() {
    // const intersects = this.renderer.raycast();
    // if (intersects[0]) {
    //   this.targetPoint?.copy(intersects[0].object.position);
    // }
  }

  getShotAngle(target: Vector3) {
    const adjacent = this.camera?.instance?.position.distanceTo(
      target
    ) as number;
    let opposite = this.cameraLookAtPoint?.y || 0;
    opposite += this.cameraHeight;
    this.shotAngle =
      (Math.atan(opposite / adjacent) * 100 * Math.PI) / 180 - Math.PI / 6;
    return this.shotAngle;
  }

  unset() {
    if (this.isSet) {
      this.isSet = false;
      // signal.off("mouse_move");
      signal.off("mouse_down");
    }
  }

  start() {
    if (!this.isStarted) {
      this.isStarted = true;
    }
  }

  stop() {
    if (this.isStarted) {
      this.isStarted = false;
    }
  }

  keyAction(e: any) {
    const key = e.key;
    switch (key) {
      case "g":
        break;
    }
  }

  enterGameView() {
    this.isGameView = true;
    this.set();
    this.gameCamCtrl?.setCamGameMode();
    this.instance.visible = true;
    window.addEventListener("keydown", this.keyAction);
  }

  leaveGameView() {
    this.isGameView = false;
    this.gameCamCtrl?.unsetCamGameMode();
    this.unsetDebug();
    this.instance.visible = false;

    window.removeEventListener("keydown", this.keyAction);
    this.unset();
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[2].addFolder({ title: "Game board" });

    const startButton = this.debugTab?.addButton({
      title: "Start Game",
    }) as ButtonApi;
    startButton.on("click", () => {
      this.start();
    });

    const stopButton = this.debugTab?.addButton({
      title: "Stop Game",
    }) as ButtonApi;
    stopButton.on("click", () => {
      this.stop();
    });
  }

  unsetDebug() {
    if (this.debugTab) this.debug.ui?.pages[2].remove(this.debugTab);
  }
}
