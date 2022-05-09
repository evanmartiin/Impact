import type Mouse from "@/webgl/controllers/Mouse";
import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Group, PerspectiveCamera, Vector3, type Scene } from "three";
import type { FolderApi, ButtonApi } from "tweakpane";
import Targets from "./Targets";
import Seed from "./Seed";
import type Renderer from "@/webgl/Renderer";

export default class SeedGameHub {
  private experience: Experience = new Experience();
  private mouse: Mouse = this.experience.mouse as Mouse;
  private scene: Scene | null = null;
  private renderer: Renderer = this.experience.renderer as Renderer;
  private camera: PerspectiveCamera | null = null;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public instance: Group = new Group();
  private prevCamPos = new Vector3(0, 0, 0);
  private lookAtPos = new Vector3(0, 0, 0);
  private lookAtPosExpectedX = 0;
  private lookAtPosExpectedY = 0;
  private prevLookAtX = 0;
  private prevLookAtY = 0;

  private distanceLookAt = -5;
  private heightLookAt = 0.3;
  private cameraHeight = 2;

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

  public camdebuging = false;

  constructor(scene: Scene, camera: PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
  }

  init() {
    this.isInit = true;
    this.setTargets();
    this.seed = new Seed(this.scene as Scene);
    this.targetPoint = new Vector3();
    this.cameraLookAtPoint = new Vector3();
    this.scene?.add(this.instance);
    this.set();
    this.setDebug();
  }

  setTargets() {
    this.targets = new Targets();
    this.targets.setModel();
    if (this.targets.instance) this.instance.add(this.targets.instance);
  }

  update() {
    if (this.isGameView) {
      if (!this.camdebuging) this.fixCamera();
    }
  }

  fixCamera() {
    if (this.camera) {
      console.log(this.camera);
      this.camera.position.set(0, this.cameraHeight, 0);
    }
    this.setCameraLookAt();
  }

  setCameraLookAt() {
    if (this.camera) {
      let x = this.prevLookAtX;
      let y = this.prevLookAtY;

      if (this.lookAtPosExpectedY > 0) {
        x += (this.lookAtPosExpectedY * 0.7 - x) * 0.02;
      } else {
        x += (this.lookAtPosExpectedY * 0.7 - x) * 0.02;
      }
      if (this.lookAtPosExpectedX > 0) {
        y += (this.lookAtPosExpectedX * 0.5 - y) * 0.02;
      } else {
        y += (this.lookAtPosExpectedX * 0.5 - y) * 0.02;
      }

      this.prevLookAtX = x;
      this.prevLookAtY = y;

      const yc = -x + this.heightLookAt;
      const xc = -y;
      const zc = -this.distanceLookAt;

      this.cameraLookAtPoint?.set(xc, yc, zc);
      this.camera.lookAt(xc, yc, zc);
    }
  }
  appear() {
    this.instance.visible = true;
  }
  disappear() {
    this.instance.visible = false;
  }

  set() {
    if (!this.isInit) {
      this.init();
    } else if (!this.isSet) {
      this.isSet = true;
      this.appear();
      this.mouse.on("mousemove", () => this.moveCamera());
      this.mouse.on("mousedown", () => this.mouseClick());
    }
  }

  mouseClick() {
    this.getIntersects();
    const target = new Vector3().copy(this.cameraLookAtPoint || new Vector3(0));
    target.y = 0;
    console.log(target);
    this.seed?.shot(target, this.getShotAngle());
  }

  getIntersects() {
    // const intersects = this.renderer.raycast();
    // console.log(intersects);
    // if (intersects[0]) {
    //   this.targetPoint?.copy(intersects[0].object.position);
    // }
  }

  getShotAngle() {
    const adjacent = Math.abs(this.distanceLookAt);
    let opposite = this.cameraLookAtPoint?.y || 0;
    opposite += this.cameraHeight;
    this.shotAngle = (Math.atan(opposite / adjacent) * 100 * Math.PI) / 180;
    return this.shotAngle;
  }

  unset() {
    if (this.isSet) {
      this.isSet = false;
      this.mouse.off("mousemove");
      this.mouse.off("mousedown");
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

  enterView() {
    if (!this.isGameView) {
      this.isGameView = true;
      if (this.camera && this.camera) {
        this.prevCamPos = this.prevCamPos.copy(this.camera.position);
        this.lookAtPos.copy(this.defaultCenterPos);
      }
      this.set();
    }
  }

  leaveView() {
    this.isGameView = false;
    if (this.camera && this.camera) {
      this.camera.lookAt(0, 0, 0);
      this.lookAtPos.set(0, 0, 0);
      this.camera.position.copy(this.prevCamPos);
    }
    this.unsetDebug();
    this.disappear();
    this.unset();
  }

  moveCamera() {
    this.lookAtPosExpectedX =
      (this.mouse.left - window.innerWidth / 2) / (window.innerWidth / 2);
    this.lookAtPosExpectedY =
      (this.mouse.top - window.innerHeight / 2) / (window.innerHeight / 2);
    this.getShotAngle();
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
      this.camdebuging = false;
    });
    const debugCam = this.debugTab?.addButton({
      title: "Toggle Cam mode",
    }) as ButtonApi;
    debugCam.on("click", () => {
      this.camdebuging = !this.camdebuging;
    });
  }

  unsetDebug() {
    if (this.debugTab) this.debug.ui?.pages[2].remove(this.debugTab);
  }
}
