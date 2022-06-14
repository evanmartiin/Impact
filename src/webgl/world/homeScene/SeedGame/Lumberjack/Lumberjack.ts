import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
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
  AnimationMixer,
  SkeletonHelper,
} from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PhysicCtrl from "../Controllers/Physic/PhysicCtrl";
import type { ICollider } from "../Controllers/Physic/PhysicCtrl";
import lamberjackSettings from "./LumberjackSettings";
import getRandomFloatBetween from "@/utils/getRandomFloatBetween";
import SeedGame from "../SeedGame";
import type Tree from "../Tree/Tree";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Debug from "@/webgl/controllers/Debug";
import type Time from "@/webgl/controllers/Time";
import type IAnimation from "@/models/animation";
import type { FolderApi } from "tweakpane";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";
import physicSettings from "../Controllers/Physic/PhysicSettings";

type TLumberjackAction = "walkToTree" | "cuting" | "idle";
type TAnimationName =
  | "cut"
  | "dance"
  | "fail"
  | "hit"
  | "rage cut"
  | "taunt"
  | "walk";

export default class Lumberjack {
  private lumberjacks: Lumberjack[] = [];
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;

  private game: SeedGame = new SeedGame();
  static physicCtrl: PhysicCtrl | null = null;
  private controls: OrbitControls | null = null;
  private geometry: BoxGeometry | null = null;
  static material: MeshBasicMaterial | null = null;
  private instance: Group | null = null;
  private hitboxGeometry: Mesh | null = null;
  private hitbox: Box3 = new Box3();
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
  private action: TLumberjackAction = "idle";
  static gltf: GLTF | null = null;
  private model: Group | null = null;
  private currentAnim: TAnimationName = "walk";
  private animation: IAnimation = {
    mixer: null,
    actions: {},
    play: null,
  };

  constructor(scene: Scene, camera: Camera) {
    this.lumberjacks.push(this);
    if (!Lumberjack.physicCtrl) Lumberjack.physicCtrl = new PhysicCtrl(scene);
    this.floor = Lumberjack.physicCtrl.floorMesh;
    this.colliders = Lumberjack.physicCtrl.colliders;
    this.scene = scene;
    this.controls = camera.controls;
    this.set();
    this.setAnimation();
    this.setAction("idle");
    signal.on("updateLumberjackTarget", () => this.getNearestTree());
  }

  getNearestTree() {
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
        this.setAction("walkToTree");
      }
    }
    // this.getTreeDirection();
  }

  getTreeDirection() {
    const newDirection = new Vector3();
    if (this.instance && this.targetedTree?.instance?.position)
      newDirection
        .subVectors(this.instance.position, this.targetedTree.instance.position)
        .normalize()
        .setLength(0.2);
    const origin = this.instance?.position;
    const length = 0.2;
    const hex = 0xff0000;
    const arrowHelper = new ArrowHelper(newDirection, origin, length, hex);
    this.scene?.add(arrowHelper);
    this.moveDirection = newDirection;
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.pages[2].addFolder({
      title: "Character",
    });
  }
  setAnimation() {
    this.animation.mixer = new AnimationMixer(this.instance as Group);

    // Actions
    this.animation.actions = {};
    if (Lumberjack.gltf && this.animation) {
      this.animation.actions["cut"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[0]
      );
      this.animation.actions["dance"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[1]
      );
      this.animation.actions["fail"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[2]
      );
      this.animation.actions["hit"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[3]
      );
      this.animation.actions["idle"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[4]
      );
      this.animation.actions["rage cut"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[5]
      );
      this.animation.actions["taunt"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[6]
      );
      this.animation.actions["walk"] = this.animation.mixer.clipAction(
        Lumberjack.gltf.animations[7]
      );

      this.animation.actions["current"] =
        this.animation.actions[this.currentAnim];
      this.animation.actions.current.play();

      // Play the action
      this.animation.play = (name) => {
        const newAction = this.animation.actions[name];
        const oldAction = this.animation.actions.current;
        newAction.reset();
        newAction.play();
        newAction.crossFadeFrom(oldAction, 1, false);
        this.animation.actions.current = newAction;
      };
    }

    // Debug
    if (this.debug.active) {
      const playCut = this.debugFolder?.addButton({
        title: "Cut",
      });
      const playWalk = this.debugFolder?.addButton({
        title: "Play walk",
      });
      playCut?.on("click", () => this.setAnim("cut"));
      playWalk?.on("click", () => this.setAnim("walk"));
    }
  }

  setAnim(animName: TAnimationName) {
    if (this.animation?.play) {
      this.animation.play(animName);
      this.currentAnim = animName;
    }
  }

  setAction(action: TLumberjackAction) {
    switch (action) {
      case "idle":
        this.setColor(0x00ffff);
        break;
      case "walkToTree":
        this.setColor(0xffff00);
        break;
      case "cuting":
        this.setColor(0xff0000);
        break;
    }
  }

  setColor(color: number) {
    // if (Array.isArray(this.instance?.material)) {
    //   this.instance?.material.map((m) => {
    //     (m as MeshBasicMaterial).color.setHex(color);
    //   });
    // } else {
    //   (this.instance?.material as MeshBasicMaterial).color.setHex(color);
    // }
  }

  set() {
    if (!this.instance) {
      if (!this.geometry)
        // this.geometry = new CylinderGeometry(0.04, 0.04, 0.12, 16);
        this.geometry = new BoxGeometry(0.08, 0.12, 0.08);
      if (!Lumberjack.material)
        Lumberjack.material = new MeshBasicMaterial({
          color: 0x00ff,
          wireframe: true,
        });

      if (!Lumberjack.gltf) {
        Lumberjack.gltf = this.loaders.items["lumberjack-model"] as GLTF;
      }
      this.model = (SkeletonUtils as any).clone(Lumberjack.gltf.scene);

      if (this.model) {
        this.instance = this.model;
        this.instance?.position.copy(lamberjackSettings.basePosition);
        this.instance.rotation.y += Math.PI;
        this.instance.scale.setScalar(0.5);
        const skeletonHelper = new SkeletonHelper(this.instance);
        this.scene?.add(skeletonHelper);
        if (this.geometry) {
          this.hitboxGeometry = new Mesh(this.geometry, Lumberjack.material);
          this.hitboxGeometry?.geometry.computeBoundingBox();
          this.hitbox
            .copy(this.hitboxGeometry?.geometry.boundingBox as Box3)
            .applyMatrix4(this.hitboxGeometry?.matrixWorld as Matrix4);

          this.instance.add(this.hitboxGeometry);
          this.hitboxGeometry.position.y += 0.05;
        }
      }

      const randomBoolean = Math.random() < 0.5;

      if (randomBoolean && this.instance) {
        this.instance.position.x += getRandomFloatBetween(0, 0.1, 2);
      } else if (this.instance) {
        this.instance.position.x -= getRandomFloatBetween(0, 0.1, 2);
      }
      (this.instance as any).capsuleInfo = {
        radius: 0.08,
        floorDistance: 0.01,
        segment: new Line3(new Vector3(), new Vector3(0, 0.02, 0.0)),
      };

      if (this.instance) this.scene?.add(this.instance);
      this.setAnimation();
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
    this.hitbox
      .copy(this.hitboxGeometry?.geometry.boundingBox as Box3)
      .applyMatrix4(this.hitboxGeometry?.matrixWorld as Matrix4);

    this.animation.mixer?.update(this.time.delta * 0.0001);

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
        lamberjackSettings.maxDistanceBetweenLJAndTree * 0.0001
      ) {
        if (
          this.instance?.position.x > this.targetedTree?.instance?.position.x
        ) {
          this.instance.position.x -= offsetMove;
        }
        if (
          this.instance?.position.x < this.targetedTree?.instance?.position.x
        ) {
          this.instance.position.x += offsetMove;
        }

        if (
          this.instance?.position.z > this.targetedTree?.instance?.position.z
        ) {
          this.instance.position.z -= offsetMove;
        }
        if (
          this.instance?.position.z < this.targetedTree?.instance?.position.z
        ) {
          this.instance.position.z += offsetMove;
        }
      } else {
        this.setAction("cuting");
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
        if (distance < capsuleInfo.floorDistance) {
          const depth = capsuleInfo.floorDistance - distance;
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

  isInHitBox(point: Vector3) {
    return this.hitbox.containsPoint(point);
  }

  resetPos() {
    this.playerVelocity.set(0, 0, 0);
    this.instance?.position.copy(lamberjackSettings.basePosition);
  }
}
