import Camera from "@/webgl/world/Camera";
import { isLocked, setLockMouseMode } from "@/utils/lockMouseMode";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import type Mouse from "@/webgl/controllers/Mouse";
import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Group, PerspectiveCamera, Vector3, Euler, type Scene } from "three";
import type { FolderApi, ButtonApi } from "tweakpane";
import Targets from "./Targets/Targets";
import Seed from "./Seed/Seed";
import type Renderer from "@/webgl/Renderer";
import Helper from "./Helper/Helper";

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
  private lookAtPos = new Vector3(0, 0, 0);
  private helper: Helper | null = null;
  private angleTarget = new Vector3();
  private lookAtPosExpectedX = 0;
  private lookAtPosExpectedY = 0;
  private prevLookAtX = 0;
  private prevLookAtY = 0;

  private distanceLookAt = -30;
  private cameraHeight = 7;
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

  public camdebuging = false;

  private currentX = window.innerWidth / 2;
  private currentY = window.innerHeight / 2;

  private gameControls: TrackballControls | null = null;

  constructor(scene: Scene, camera: Camera) {
    this.gameControls = new TrackballControls(
      camera.instance as PerspectiveCamera,
      this.renderer.canvas,
      this.scene
    );
    // this.gameControls.maxPolarAngle = Math.PI / 2 ;
    // this.gameControls.minPolarAngle = Math.PI / 2;
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
    this.helper = new Helper(this.scene as Scene);
  }

  setTargets() {
    this.targets = new Targets();
    this.targets.setMesh();
    if (this.targets.instance) this.instance.add(this.targets.instance);
  }

  update() {
    if (this.isGameView) {
      if (this.helper?.instance)
        this.helper.instance.position.set(0, this.cameraHeight, 5);
      if (!this.camdebuging) this.fixCamera();
      this.seed?.update();
    }
  }

  fixCamera() {
    if (this.camera) {
      this.camera.instance?.position.set(0, this.cameraHeight, 5);
    }
    // if (this.camera) this.camera.instance?.lookAt(this.defaultCenterPos);
    // this.setCameraLookAt();
  }

  setCameraLookAt() {
    if (this.camera) {
      let x = this.prevLookAtX;
      let y = this.prevLookAtY;

      if (this.lookAtPosExpectedY > 0) {
        x += (this.lookAtPosExpectedY * 16 - x) * 0.02;
      } else {
        x += (this.lookAtPosExpectedY * 16 - x) * 0.02;
      }
      if (this.lookAtPosExpectedX > 0) {
        y += (this.lookAtPosExpectedX * 16 - y) * 0.02;
      } else {
        y += (this.lookAtPosExpectedX * 16 - y) * 0.02;
      }

      this.prevLookAtX = x;
      this.prevLookAtY = y;

      // const xc = -y;
      // const yc = x + this.heightLookAt;
      // const zc = -this.distanceLookAt;
      const xc = -this.lookAtPosExpectedX * 20;
      const yc = this.lookAtPosExpectedY * 20;
      const zc = -this.distanceLookAt;

      // this.cameraLookAtPoint?.set(xc, yc, zc);
      // this.camera.instance?.lookAt(xc, yc, zc);

      // this.cameraLookAtPoint?.set(xc, yc, zc);
      // this.camera.instance?.lookAt(xc, yc, zc);
      // this.helper?.setCursor(xc, yc, zc);
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

  keyAction(e: any) {
    const key = e.key;
    switch (key) {
      case "r":
        break;
    }
  }

  enterView() {
    if (!this.isGameView) {
      this.isGameView = true;
      if (this.camera && this.camera) {
        this.prevCamPos = this.prevCamPos.copy(
          this.camera.instance?.position as Vector3
        );
        this.lookAtPos.copy(this.defaultCenterPos);
        if (this.camera.controls) this.camera.controls.enabled = false;
        Camera.isCtrlActive = false;
        if (this.gameControls) this.gameControls.enabled = true;
        // this.gameControls?.lock();
        // this.gameControls?.connect();
        this.camera.instance?.lookAt(this.defaultCenterPos);
      }
      window.addEventListener("keydown", this.keyAction.bind(this));
      this.set();
      // setLockMouseMode(this.experience.canvas as HTMLCanvasElement);
      // if (!isLocked(this.experience.canvas as HTMLCanvasElement)) {
      //   this.experience.canvas?.requestPointerLock();
      // }
    }
  }

  leaveView() {
    this.isGameView = false;
    if (this.camera && this.camera) {
      this.camera.instance?.lookAt(0, 0, 0);
      if (this.camera.controls) this.camera.controls.enabled = true;
      this.lookAtPos.set(0, 0, 0);
      this.camera.instance?.position.copy(this.prevCamPos);
    }
    Camera.isCtrlActive = false;
    if (this.gameControls) this.gameControls.enabled = true;
    // this.gameControls?.unlock();
    // this.gameControls?.disconnect();
    this.unsetDebug();
    this.disappear();

    window.removeEventListener("keydown", this.keyAction);
    this.unset();
    // if (isLocked(this.experience.canvas as HTMLCanvasElement)) {
    //   (this.experience.canvas as any).exitPointerLock();
    // }
  }

  moveCamera() {
    // console.log(
    //   this.mouse.mouseMoveEvent?.movementX,
    //   this.mouse.mouseMoveEvent?.movementY
    // );

    if (
      this.mouse?.mouseMoveEvent?.movementX &&
      this.mouse?.mouseMoveEvent?.movementY
    ) {
      this.currentX += this.mouse.mouseMoveEvent.movementX;
      if (this.currentX <= 0) {
        this.currentX = 0;
      }
      if (this.currentX >= window.innerWidth * 10) {
        this.currentX = window.innerWidth * 10;
      }
      this.currentY += this.mouse.mouseMoveEvent.movementY;

      if (this.currentY <= 0) {
        this.currentY = 0;
      }
      if (this.currentY >= window.innerHeight * 10) {
        this.currentY = window.innerHeight * 10;
      }
    }
    this.lookAtPosExpectedX =
      (this.currentX - (window.innerWidth * 2) / 2) / (window.innerWidth / 2);
    this.lookAtPosExpectedY =
      -(this.currentY - (window.innerHeight * 2) / 2) /
      ((window.innerHeight * 2) / 2);
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
