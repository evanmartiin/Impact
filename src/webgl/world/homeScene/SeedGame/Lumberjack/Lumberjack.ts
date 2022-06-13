import signal from "signal-js";
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
  Group,
  ArrowHelper,
} from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PhysicCtrl from "../Controllers/Physic/PhysicCtrl";
import type { ICollider } from "../Controllers/Physic/PhysicCtrl";
import lamberjackSettings from "./LumberjackSettings";
import getRandomFloatBetween from "@/utils/getRandomFloatBetween";
import SeedGame from "../SeedGame";
import type Tree from "../Tree/Tree";

interface state {
  doing: 'walkToTree' | 'cuting' | 'idle';
}

export default class Lumberjack {
  private lumberjacks: Lumberjack[] = [];
  private game: SeedGame = new SeedGame();
  static physicCtrl: PhysicCtrl | null = null;
  private controls: OrbitControls | null = null;
  static geometry: BoxGeometry | null = null;
  static material: MeshBasicMaterial | null = null;
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
  private targetedTree: Tree | null = null;
  private moveDirection: Vector3 | null = null;
  private state = {
    doing: ''
  }

  constructor(scene: Scene, camera: Camera) {
    this.lumberjacks.push(this);
    if (!Lumberjack.physicCtrl) Lumberjack.physicCtrl = new PhysicCtrl(scene);
    this.floor = Lumberjack.physicCtrl.floorMesh;
    this.colliders = Lumberjack.physicCtrl.colliders;
    this.scene = scene;
    this.controls = camera.controls;
    this.set();
    signal.on("updateLumberjackTarget", () => this.getNearestTree());
  }

  getNearestTree() {
    console.log("object");
    if (!this.targetedTree && this.game.trees.length > 0) {
      let nearestTree: Tree | null = null;
      let minDistance: number | null = null;
      this.game.trees.map((t) => {
        let tempDis = (t.instance as Group).position.distanceTo(
          this.instance?.position as Vector3
        );
        if (!t.isTargeted) {
          if (minDistance === null) {
            minDistance = tempDis;
            nearestTree = t;
          } else if (tempDis < minDistance) {
            minDistance = tempDis;
            nearestTree = t;
          }
        }
      });
      if (nearestTree) {
        (nearestTree as Tree).isTargeted = true;
        this.targetedTree = nearestTree;
      }
    }
    // this.getTreeDirection();
  }

  getTreeDirection() {
    const newDirection = new Vector3();
    if (this.instance && this.targetedTree?.instance?.position)
      newDirection
        .subVectors(
          (this.instance as Mesh).position,
          this.targetedTree.instance.position
        )
        .normalize()
        .setLength(0.2);
    const origin = this.instance?.position;
    const length = 0.2;
    const hex = 0xff0000;
    const arrowHelper = new ArrowHelper(newDirection, origin, length, hex);
    this.scene?.add(arrowHelper);
    this.moveDirection = newDirection;
  }

  set() {
    if (!this.instance) {
      if (!Lumberjack.geometry)
        Lumberjack.geometry = new BoxGeometry(0.02, 0.02, 0.02);
      if (!Lumberjack.material)
        Lumberjack.material = new MeshBasicMaterial({ color: 0x00ff00 });
      this.instance = new Mesh(Lumberjack.geometry, Lumberjack.material);
      this.instance.position.copy(lamberjackSettings.basePosition);
      const randomBoolean = Math.random() < 0.5;
      if (randomBoolean) {
        this.instance.position.x += getRandomFloatBetween(0, 0.1, 2);
      } else {
        this.instance.position.x -= getRandomFloatBetween(0, 0.1, 2);
      }
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

    const offsetMove = lamberjackSettings.speed * delta * 0.01;
    if (this.targetedTree && this.instance && this.targetedTree.instance) {
      if (
        this.instance?.position.distanceTo(
          this.targetedTree?.instance?.position
        ) >
        lamberjackSettings.maxDistanceBetweenLJAndTree * 0.001
      ) {
        if (
          this.instance?.position.x > this.targetedTree?.instance?.position.x
        ) {
          this.instance.position.x -= offsetMove;
          console.log("+x");
        }
        if (
          this.instance?.position.x < this.targetedTree?.instance?.position.x
        ) {
          this.instance.position.x += offsetMove;
          console.log("-x");
        }

        if (
          this.instance?.position.z > this.targetedTree?.instance?.position.z
        ) {
          this.instance.position.z -= offsetMove;
          console.log("+z");
        }
        if (
          this.instance?.position.z < this.targetedTree?.instance?.position.z
        ) {
          this.instance.position.z += offsetMove;
          console.log("-z");
        }
      }
    }

    if (this.fwdPressed) {
      this.tempVector.set(0, 0, -0.2).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.speed * delta
      );
    }

    if (this.bkdPressed) {
      this.tempVector.set(0, 0, 0.2).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.speed * delta
      );
    }

    if (this.lftPressed) {
      this.tempVector.set(-0.2, 0, 0).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.speed * delta
      );
    }

    if (this.rgtPressed) {
      this.tempVector.set(0.2, 0, 0).applyAxisAngle(this.upVector, angle);
      this.instance?.position.addScaledVector(
        this.tempVector,
        lamberjackSettings.speed * delta
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
