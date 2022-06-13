import { webglStore } from "./../../../../../../stores/webglStore";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { isLocked, setLockMouseMode } from "@/utils/lockMouseMode";
import { Euler, Vector3, PerspectiveCamera } from "three";
import type Camera from "@/webgl/world/Camera";
import type World from "@/webgl/world/World";
import type Mouse from "@/webgl/controllers/Mouse";
import Experience from "@/webgl/Experience";
import type Renderer from "@/webgl/Renderer";
import signal from "signal-js";
import gameCamSettings from "./GameCamSettings";

export class GameCamCtrl {
  private experience: Experience = new Experience();
  private renderer: Renderer = this.experience.renderer as Renderer;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private camera: Camera | null = null;
  private world: World | null = null;
  private _euler = new Euler(0, 0, 0, "YXZ");
  private _PI_2 = Math.PI / 2;
  private pointerSpeed = 1.0;
  private minPolarAngle = 1.6;
  private maxPolarAngle = Math.PI - 0.9;
  private prevCamPos = new Vector3(0, 0, 0);
  private gameControls: PointerLockControls | null = null;
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
    document.addEventListener(
      "pointerlockerror",
      this.errorCallback.bind(this),
      false
    );
    document.addEventListener(
      "mozpointerlockerror",
      this.errorCallback.bind(this),
      false
    );
    document.addEventListener(
      "webkitpointerlockerror",
      this.errorCallback.bind(this),
      false
    );

    this.camera = camera;
    this.world = this.experience.world;
    this.gameControls = new PointerLockControls(
      camera.instance as PerspectiveCamera,
      this.renderer.canvas
    );
    this.gameControls?.addEventListener(
      "unlock",
      this.lockChangeEvent.bind(this)
    );
    signal.on("resume_game", this.lockMouse.bind(this));
  }
  errorCallback() {
    setTimeout(() => {
      this.lockMouse();
    }, 500);
  }

  private lockMouse() {
    if (this.world) {
      // Desactive orbit control
      this.world.PARAMS.isCtrlActive = false;
    }
    if (this.experience.world?.controls)
      this.experience.world.controls.enabled = false;

    setLockMouseMode(this.experience.canvas as HTMLCanvasElement);
    if (!isLocked(this.experience.canvas as HTMLCanvasElement)) {
      this.experience.canvas?.requestPointerLock();
    }
    this.gameControls?.lock();
    this.gameControls?.connect();
    this.isFirstMove = true;
    this.isMouseLocked = true;
    signal.emit("set_target_cursor", false);
  }

  private lockChangeEvent() {
    if (this.gameControls?.isLocked) {
      this.isMouseLocked = false;
      signal.emit("set_target_cursor", true);
      signal.emit("open_menu", "seedGameMode");
    }
  }

  private unlockMouse() {
    // Active orbit control
    if (this.world) {
      this.world.PARAMS.isCtrlActive = true;
    }
    if (this.experience.world?.controls)
      this.experience.world.controls.enabled = true;
    if (isLocked(this.experience.canvas as HTMLCanvasElement)) {
      (this.experience.canvas as any).exitPointerLock();
    }
    this.gameControls?.unlock();
    this.gameControls?.disconnect();
    this.isMouseLocked = false;
    
  }

  setCamGameMode() {
    this.lockMouse();
    signal.on("mouse_move", () => this.moveCamera());

    this.prevCamPos = this.prevCamPos.copy(
      this.camera?.instance?.position as Vector3
    );
    this.camera?.instance?.position.copy(gameCamSettings.gameCameraPosition);
    this.camera?.instance?.lookAt(this.defaultCenterPos);
  }

  unsetCamGameMode() {
    this.unlockMouse();
    signal.off("mouse_move");

    this.camera?.instance?.position.copy(this.prevCamPos);
    this.camera?.instance?.lookAt(0, 0, 0);
  }

  private moveCamera() {
    if (this.mouse.mouseMoveEvent && this.isMouseLocked) {
      const movementX =
        this.mouse.mouseMoveEvent.movementX ||
        (this.mouse.mouseMoveEvent as any).mozMovementX ||
        (this.mouse.mouseMoveEvent as any).webkitMovementX ||
        0;
      const movementY =
        this.mouse.mouseMoveEvent.movementY ||
        (this.mouse.mouseMoveEvent as any).mozMovementY ||
        (this.mouse.mouseMoveEvent as any).webkitMovementY ||
        0;

      if (this.camera?.instance)
        this._euler.setFromQuaternion(this.camera.instance.quaternion);

      this._euler.y -= movementX * 0.0002 * this.pointerSpeed;
      this._euler.x -= movementY * 0.0002 * this.pointerSpeed;

      this._euler.x = Math.max(
        this._PI_2 - this.maxPolarAngle,
        Math.min(this._PI_2 - this.minPolarAngle, this._euler.x)
      );

      if (this._euler.y > 0) {
        // Max Rigth
        if (this._euler.y < 2.635) {
          this._euler.y = 2.635;
        }
      } else {
        // Max left
        if (this._euler.y > -2.633) {
          this._euler.y = -2.633;
        }
      }
      if (this.isFirstMove) {
        this.isFirstMove = false;
        this._euler.y = Math.PI;
      }
      if (this.camera?.instance)
        this.camera.instance.quaternion.setFromEuler(this._euler);
    }
  }
}
