import type Debug from "@/controllers/globalControllers/Debug";
import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import type { GPSPos } from "@/models/webgl/GPSPos.model";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group, Scene } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi } from "tweakpane";
import Tree from "../Tree/Tree";

export default class Earth {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private trees: Tree[] | null = null;
  private earth: Group | null = null;

  constructor() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setTrees();
    this.appear();

    this.setDebug();
  }

  setGeometry() {}

  setMaterial() {}

  setMesh() {
    const earthModel = this.loaders.items["earth"] as GLTF;

    this.earth = new Group();
    earthModel.scene.children.map((child) => {
      this.earth?.add(child);
    });
    this.earth.scale.set(3, 3, 3);
    this.scene.add(this.earth);
  }

  setTrees() {
    const GPSPosArray: GPSPos[] = [];

    for (let i = 0; i < 100; i++) {
      GPSPosArray.push({
        lat: Math.round(Math.random() * 360 - 180),
        lon: Math.round(Math.random() * 360 - 180),
      });
    }

    GPSPosArray.forEach((GPSpos: GPSPos) => {
      const cube = new Tree(GPSpos.lat, GPSpos.lon);
      this.trees?.push(cube);
    });
  }
  appear() {
    anime({
      targets: this.earth?.position,
      y: [-5, 0],
      x: [-5, 0],
      easing: "easeInOutQuart",
      // loop: true,
      // direction: "alternate",
      duration: 1000,
    });
  }
  disappear() {
    anime({
      targets: this.earth?.position,
      y: [0, -5],
      x: [0, -5],
      easing: "easeInOutQuart",
      // loop: true,
      // direction: "alternate",
      duration: 1000,
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });
      if (this.earth?.position) {
        this.debugFolder?.addInput(this.earth?.position, "x", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earth.position, "y", {
          min: -10,
          max: 10,
          step: 0.1,
        });
        this.debugFolder?.addInput(this.earth.position, "z", {
          min: -10,
          max: 10,
          step: 0.1,
        });
      }
    }
  }
  destroy() {
    this.trees?.map((tree) => tree.destroy());
  }
}
