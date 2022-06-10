import type Camera from "@/webgl/world/Camera";
import {
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Scene,
  Vector3,
  Matrix4,
  Line3,
  Box3,
} from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PhysicCtrl from "../Controllers/Physic/PhysicCtrl";
import type { ICollider } from "../Controllers/Physic/PhysicCtrl";
import physicSettings from "../Controllers/Physic/PhysicSettings";
import lamberjackSettings from "./LumberjackSettings";

export default class Lumberjack {
  private physicCtrl: PhysicCtrl | null = null;
  private controls: OrbitControls | null = null;
  private geometry: BoxGeometry | null = null;
  private material: MeshBasicMaterial | null = null;
  private instance: Mesh | null = null;
  private scene: Scene | null;
  private playerVelocity = new Vector3();
  private playerIsOnGround = false;
  private upVector = new Vector3(0, 1, 0);
  private tempVector = new Vector3();
  private tempVector2 = new Vector3();
  private tempBox = new Box3();
  private tempMat = new Matrix4();
  private tempSegment = new Line3();
  private floor: Mesh | null = null;
  private colliders: ICollider[] = [];
  private fwdPressed = false;
  private bkdPressed = false;
  private lftPressed = false;
  private rgtPressed = false;
  constructor(scene: Scene, camera: Camera) {
    this.physicCtrl = new PhysicCtrl(scene);
    console.log(this.physicCtrl.colliders);
    this.floor = this.physicCtrl.floorMesh;
    this.colliders = this.physicCtrl.colliders;
    this.scene = scene;
    this.controls = camera.controls;
  }
  set() {
    if (!this.instance) {
      this.geometry = new BoxGeometry(0.02, 0.02, 0.02);
      this.material = new MeshBasicMaterial({ color: 0x00ff00 });
      this.instance = new Mesh(this.geometry, this.material);
      this.instance.position.copy(lamberjackSettings.basePosition);
      (this.instance as any).capsuleInfo = {
        radius: 0.02,
        segment: new Line3(new Vector3(), new Vector3(0, 0.02, 0.0)),
      };
      this.scene?.add(this.instance);
      window.addEventListener("keydown", this.keyDown.bind(this));
      window.addEventListener("keyup", this.keyUp.bind(this));
    } else {
      this.instance.visible = true;
      window.removeEventListener("keydown", this.keyDown.bind(this));
      window.removeEventListener("keyup", this.keyUp.bind(this));
    }
  }
  unset() {
    if (this.instance) this.instance.visible = false;
    window.removeEventListener("keydown", this.keyDown.bind(this));
    window.removeEventListener("keyup", this.keyUp.bind(this));
  }
  keyDown(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW":
        this.fwdPressed = true;
        break;
      case "KeyS":
        this.bkdPressed = true;
        break;
      case "KeyD":
        this.rgtPressed = true;
        break;
      case "KeyA":
        this.lftPressed = true;
        break;
      case "Space":
        if (this.playerIsOnGround) {
          this.playerVelocity.y = 5.0;
        }

        break;
    }
  }
  keyUp(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW":
        this.fwdPressed = false;
        break;
      case "KeyS":
        this.bkdPressed = false;
        break;
      case "KeyD":
        this.rgtPressed = false;
        break;
      case "KeyA":
        this.lftPressed = false;
        break;
    }
  }

  update(delta: number) {
    this.playerVelocity.y += this.playerIsOnGround
      ? 0
      : delta * lamberjackSettings.gravity;
    this.instance?.position.addScaledVector(this.playerVelocity, delta);

    const angle = this.controls?.getAzimuthalAngle() || 0;

    if (this.fwdPressed) {
      this.tempVector.set(0, 0, -0.2).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.playerSpeed * delta
      );
    }

    if (this.bkdPressed) {
      this.tempVector.set(0, 0, 0.2).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.playerSpeed * delta
      );
    }

    if (this.lftPressed) {
      this.tempVector.set(-0.2, 0, 0).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.playerSpeed * delta
      );
    }

    if (this.rgtPressed) {
      this.tempVector.set(0.2, 0, 0).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.playerSpeed * delta
      );
    }

    this.instance?.updateMatrixWorld();

    // adjust player position based on collisions
    const capsuleInfo = (this.instance as any)?.capsuleInfo;
    this.tempBox.makeEmpty();
    if (this.floor) this.tempMat.copy(this.floor.matrixWorld).invert();
    this.tempSegment.copy(capsuleInfo.segment);

    // get the position of the capsule in the local space of the collider
    this.tempSegment.start
      .applyMatrix4(this.instance?.matrixWorld as Matrix4)
      .applyMatrix4(this.tempMat);
    this.tempSegment.end
      .applyMatrix4(this.instance?.matrixWorld as Matrix4)
      .applyMatrix4(this.tempMat);

    // get the axis aligned bounding box of the capsule
    this.tempBox.expandByPoint(this.tempSegment.start);
    this.tempBox.expandByPoint(this.tempSegment.end);

    this.tempBox.min.addScalar(-capsuleInfo.radius);
    this.tempBox.max.addScalar(capsuleInfo.radius);
    this.floor?.geometry.boundsTree!.shapecast({
      intersectsBounds: (box) => {
        return box.intersectsBox(this.tempBox);
      },
      intersectsTriangle: (tri) => {
        // check if the triangle is intersecting the capsule and adjust the
        // capsule position if it is.
        const triPoint = this.tempVector;
        const capsulePoint = this.tempVector2;

        const distance = tri.closestPointToSegment(
          this.tempSegment,
          triPoint,
          capsulePoint
        );
        if (distance < capsuleInfo.radius) {
          const depth = capsuleInfo.radius - distance;
          const direction = capsulePoint.sub(triPoint).normalize();

          this.tempSegment.start.addScaledVector(direction, depth);
          this.tempSegment.end.addScaledVector(direction, depth);
        }
      },
    });
    this.colliders.map((c) => {
      c.collider.geometry.boundsTree!.shapecast({
        intersectsBounds: (box) => {
          return box.intersectsBox(this.tempBox);
        },
        intersectsTriangle: (tri) => {
          // check if the triangle is intersecting the capsule and adjust the
          // capsule position if it is.
          const triPoint = this.tempVector;
          const capsulePoint = this.tempVector2;

          const distance = tri.closestPointToSegment(
            this.tempSegment,
            triPoint,
            capsulePoint
          );
          if (distance < capsuleInfo.radius) {
            const depth = capsuleInfo.radius - distance;
            const direction = capsulePoint.sub(triPoint).normalize();

            this.tempSegment.start.addScaledVector(direction, depth);
            this.tempSegment.end.addScaledVector(direction, depth);
          }
        },
      });
    });

    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = this.tempVector;
    newPosition
      .copy(this.tempSegment.start)
      .applyMatrix4(this.floor?.matrixWorld as Matrix4);

    // check how much the collider was moved
    const deltaVector = this.tempVector2;
    deltaVector.subVectors(newPosition, this.instance?.position as Vector3);

    // if the player was primarily adjusted vertically we assume it's on something we should consider ground
    this.playerIsOnGround =
      deltaVector.y > Math.abs(delta * this.playerVelocity.y * 0.25);

    const offset = Math.max(0.0, deltaVector.length() - 1e-5);
    deltaVector.normalize().multiplyScalar(offset);

    // adjust the player model
    this.instance?.position.add(deltaVector);

    if (!this.playerIsOnGround) {
      deltaVector.normalize();
      this.playerVelocity.addScaledVector(
        deltaVector,
        -deltaVector.dot(this.playerVelocity)
      );
    } else {
      this.playerVelocity.set(0, 0, 0);
      //   if (isOnPlatform) {
      //     this.instance?.translateX(0.001);
      //   }
    }

    // if the player has fallen too far below the level reset their position to the start
    if (this.instance && this.instance.position.y < -0.2) {
      this.resetPos();
    }
  }

  resetPos() {
    this.playerVelocity.set(0, 0, 0);
    this.instance?.position.copy(lamberjackSettings.basePosition);
  }
}
