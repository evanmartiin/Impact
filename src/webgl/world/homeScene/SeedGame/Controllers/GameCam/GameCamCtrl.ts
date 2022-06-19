// import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { isLocked, setLockMouseMode } from "@/utils/lockMouseMode";
import { Euler, Vector3, PerspectiveCamera } from "three";
import type Camera from "@/webgl/world/Camera";
import type World from "@/webgl/world/World";
import type Mouse from "@/webgl/controllers/Mouse";
import Experience from "@/webgl/Experience";
import type Renderer from "@/webgl/Renderer";
import signal from "signal-js";
import gameCamSettings from "./GameCamSettings";
import CustomPointerLockControls from "./CustomPointerLockControls";

export class GameCamCtrl {
  private experience: Experience = new Experience();
  private renderer: Renderer = this.experience.renderer as Renderer;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private camera: Camera | null = null;
  private world: World | null = null;
  private _euler = new Euler(0, 0, 0, "YXZ");
  private _PI_2 = Math.PI / 2;
  private pointerSpeed = 2;
  private minPolarAngle = 1.6;
  private maxPolarAngle = Math.PI - 0.9;
  private prevCamPos = new Vector3(0, 0, 0);
  private pointerControls: CustomPointerLockControls | null = null;
  private distanceLookAt = -30;
  private heightLookAt = 0;
  private isFirstMove = false;
  private isMouseLocked = false;

  private defaultCenterPos = new Vector3(
    this.distanceLookAt,
    this.heightLookAt,
    0
  );

  constructor(camera: Camera) {
    this.camera = camera;
    this.world = this.experience.world;
    this.pointerControls = new CustomPointerLockControls(
      camera.instance as PerspectiveCamera,
      this.renderer.canvas
    );
    signal.on("resume_game", this.lockMouse.bind(this));
  }

  private lockMouse() {
    console.log("unlock");
    // Desactive orbit control
    if (this.world) {
      this.world.PARAMS.isCtrlActive = false;
    }
    if (this.experience.world?.controls)
      this.experience.world.controls.enabled = false;

    this.pointerControls?.lock();
    this.pointerControls?.connect();

    this.isMouseLocked = true;

    // signal.on("GameCamCtrl:unlocked", this.unlockMouse.bind(this));
    signal.emit("set_target_cursor", false);
  }

  private unlockMouse() {
    // Active orbit control
    if (this.world) {
      this.world.PARAMS.isCtrlActive = true;
    }
    if (this.experience.world?.controls)
      this.experience.world.controls.enabled = true;

    this.pointerControls?.unlock();
    this.pointerControls?.disconnect();
    this.isMouseLocked = false;
  }

  setCamGameMode() {
    console.log("lock function");
    this.lockMouse();

    this.prevCamPos = this.prevCamPos.copy(
      this.camera?.instance?.position as Vector3
    );
    this.camera?.instance?.position.copy(gameCamSettings.gameCameraPosition);
    this.camera?.instance?.lookAt(this.defaultCenterPos);

    signal.on("GameCamCtrl:unlocked", this.openMenu.bind(this));
  }

  unsetCamGameMode() {
    console.log("unlock function");
    this.unlockMouse();

    this.camera?.instance?.position.copy(this.prevCamPos);
    this.camera?.instance?.lookAt(0, 0, 0);

    signal.off("GameCamCtrl:unlocked", this.openMenu.bind(this));
  }

  openMenu() {
    if (this.pointerControls?.isLocked)
      signal.emit("open_menu", "seedGameMode");
  }
}
