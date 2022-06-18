import Experience from "@/webgl/Experience";
import type World from "@/webgl/world/World";
import signal from "signal-js";
import { Euler, type Camera } from "three";

const _euler = new Euler(0, 0, 0, "YXZ");
const _PI_2 = Math.PI / 2;

export default class CustomPointerLockControls {
  private experience: Experience = new Experience();
  private world: World = this.experience.world as World;
  public pointerSpeed = 2;
  public domElement;
  public camera;
  public isLocked = false;
  public isMouseMove = false;
  private minPolarAngle = 1.6;
  private maxPolarAngle = Math.PI - 0.9;
  private isFirstMove = false;

  constructor(camera: Camera, domElement: HTMLCanvasElement) {
    this.camera = camera;
    this.domElement = domElement;

    if (domElement === undefined) {
      console.warn(
        'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.'
      );
    }

    this.domElement.requestPointerLock =
      this.domElement.requestPointerLock ||
      (this.domElement as any).mozRequestPointerLock;

    document.exitPointerLock =
      document.exitPointerLock || (document as any).mozExitPointerLock;

    signal.on("GameCamCtrl:outView", this.outGameView.bind(this));
  }

  outGameView() {
    this.disconnect();
    this.unlock();
    signal.emit("set_target_cursor", true);
    signal.off("GameCamCtrl:outView", this.outGameView.bind(this));
    console.log(this.world.PARAMS.isCtrlActive);
    // if (this.world) {
    //   this.world.PARAMS.isCtrlActive = true;
    // }
    // console.log(this.experience.world?.controls);
    // if (this.experience.world?.controls)
    //   this.experience.world.controls.enabled = true;
  }

  setPointerSpeed(newSpeed: number) {
    this.pointerSpeed = newSpeed;
  }

  connect() {
    this.isMouseMove = true;
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    // lock change
    document.addEventListener(
      "pointerlockchange",
      this.onPointerlockChange.bind(this)
    );
    document.addEventListener(
      "mozpointerlockchange",
      this.onPointerlockChangeMoz.bind(this),
      false
    );
    document.addEventListener(
      "pointerlockerror",
      this.onPointerlockError.bind(this)
    );
  }

  disconnect() {
    this.isLocked = false;
    this.isMouseMove = false;
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener(
      "pointerlockchange",
      this.onPointerlockChange.bind(this)
    );
    document.removeEventListener(
      "mozpointerlockchange",
      this.onPointerlockChangeMoz.bind(this),
      false
    );
    this.domElement.ownerDocument.removeEventListener(
      "pointerlockerror",
      this.onPointerlockError.bind(this)
    );
  }

  onPointerlockChange() {
    if (document.pointerLockElement === this.domElement && this.isLocked) {
      signal.emit("GameCamCtrl:locked");
    } else {
      signal.emit("GameCamCtrl:unlocked");
      this.disconnect();
    }
  }
  onPointerlockChangeMoz() {
    if (
      (document as any).mozPointerLockElement === this.domElement &&
      !this.isLocked
    ) {
      signal.emit("GameCamCtrl:locked");
    } else {
      signal.emit("GameCamCtrl:unlocked");
      this.disconnect();
    }
  }

  onPointerlockError() {
    console.error("THREE.PointerLockControls: Unable to use Pointer Lock API");
  }

  onMouseMove(event: MouseEvent) {
    if (this.isMouseMove === false) return;

    const movementX =
      event.movementX ||
      (event as any).mozMovementX ||
      (event as any).webkitMovementX ||
      0;
    const movementY =
      event.movementY ||
      (event as any).mozMovementY ||
      (event as any).webkitMovementY ||
      0;

    _euler.setFromQuaternion(this.camera.quaternion);

    _euler.y -= movementX * 0.0002 * this.pointerSpeed;
    _euler.x -= movementY * 0.0002 * this.pointerSpeed;

    _euler.x = Math.max(
      _PI_2 - this.maxPolarAngle,
      Math.min(_PI_2 - this.minPolarAngle, _euler.x)
    );
    if (_euler.y > 0) {
      // Max Rigth
      if (_euler.y < 2.635) {
        _euler.y = 2.635;
      }
    } else {
      // Max left
      if (_euler.y > -2.633) {
        _euler.y = -2.633;
      }
    }
    if (this.isFirstMove) {
      this.isFirstMove = false;
      _euler.y = Math.PI;
    }

    this.camera.quaternion.setFromEuler(_euler);
    // this.dispatchEvent(this._changeEvent);
  }

  lock() {
    this.domElement.requestPointerLock();
    this.isLocked = true;
    this.isFirstMove = true;
  }

  unlock() {
    if ((this.domElement as any).exitPointerLock)
      (this.domElement as any).exitPointerLock();
    if (document.exitPointerLock) document.exitPointerLock();
    this.isLocked = false;
  }
}
