import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import type { GPSPos } from "@/models/webgl/GPSPos.model";
import Experience from "@/webgl/Experience";
import type Camera from "@/webgl/world/Camera";
import anime from "animejs";
import { Group, MeshBasicMaterial, Object3D, Scene, Mesh } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi } from "tweakpane";
import Tree from "../Tree/Tree";
import type Time from "@/webgl/controllers/Time";

export default class Earth {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private time: Time = this.experience.time as Time;
  private camera: Camera = this.experience.camera as Camera;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private trees: Tree[] | null = null;
  private earth: Group | null = null;
  public earthGroup: Group = new Group();
  private model: GLTF | null = null;
  private districtsMeshes: Object3D[] = [];
  private isDisplayed = false;

  constructor() {
    this.setMesh();

    this.setDebug();
  }

  setMesh() {

    this.model = this.loaders.items["earthv1"] as GLTF;
    this.earth = new Group();
    const meshes = [];
    meshes.push(...this.model.scene.children);
    meshes.push(...this.model.scenes[0].children);
    meshes.map((child) => {
      if (typeof child === "object") {
        this.earth?.add(child);
        if (
          child.name === "ville" ||
          child.name === "mamie" ||
          child.name === "maison"
        ) {
          if (child instanceof Mesh) {
            child.material = new MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
            });
            this.districtsMeshes.push(child);
          }
        }
      }
    });
    this.districtsMeshes = [...new Set(this.districtsMeshes)];

    this.earth.rotateY(Math.PI);
    this.earth.scale.set(1, 1, 1);
    this.earthGroup.add(this.earth);
    this.scene.add(this.earthGroup);
    this.earthGroup.position.set(10, 0, 0);
    this.earthGroup.scale.set(1.5, 1.5, 1.5);
    if (this.camera.instance) {
      const tl = anime.timeline({});
      tl.add(
        {
          targets: this.earthGroup?.position,
          x: [0, 0],
          y: [-10, 0],
          z: [0, 0],
          easing: "easeInOutQuart",
          duration: 1000,
        },
        0
      );
    }
    this.isDisplayed = true;
  }

  appear() {
    if (!this.isDisplayed) {
      if (this.earthGroup && this.camera.instance && this.camera.controls) {
        const tl = anime.timeline({});
        tl.add(
          {
            targets: this.earthGroup?.position,
            x: [0, 0],
            y: [-10, 0],
            z: [0, 0],
            easing: "easeInOutQuart",
            duration: 700,
          },
          300
        );
        tl.add(
          {
            targets: this.earthGroup?.scale,
            x: [this.earthGroup?.scale.x, 1.5],
            y: [this.earthGroup?.scale.y, 1.5],
            z: [this.earthGroup?.scale.z, 1.5],
            easing: "easeInOutQuart",
            duration: 700,
          },
          300
        );
      }
      this.isDisplayed = true;
    }
  }
  disappear() {
    if (this.isDisplayed) {
      const tl = anime.timeline({});
      tl.add(
        {
          targets: this.earthGroup?.position,
          x: [this.earthGroup?.position.x, 0],
          y: [this.earthGroup?.position.y, -10],
          z: [this.earthGroup?.position.z, 0],
          easing: "easeInOutQuart",
          duration: 1000,
        },
        0
      );
      tl.add(
        {
          targets: this.earthGroup?.scale,
          x: [this.earthGroup?.scale.x, 0.1],
          y: [this.earthGroup?.scale.y, 0.1],
          z: [this.earthGroup?.scale.z, 0.1],
          easing: "easeInOutQuart",
          duration: 700,
        },
        0
      );
      this.isDisplayed = false;
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });
      if (this.earthGroup?.position) {
        this.debugFolder?.addInput(this.earthGroup?.position, "x", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earthGroup.position, "y", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earthGroup.position, "z", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earthGroup.scale, "x", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earthGroup.scale, "y", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earthGroup.scale, "z", {
          min: -10,
          max: 10,
          step: 0.1,
        });
      }
    }
  }
  update() {
    this.districtsMeshes.forEach((district) => {
      if (district instanceof Mesh) {
        district.material.opacity = (Math.cos(this.time.elapsed / 300) + 1) / 2;
      }
    });
  }
  destroy() {
    this.trees?.map((tree) => tree.destroy());
  }
}
