import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import type { Mesh, Object3D } from "three";
import { Group } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export default class District1 {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  public instance: Group = new Group();

  constructor() {
    this.setModel();
  }

  setModel() {
    const districtModel = this.loaders.items["map"] as GLTF;
    console.log(districtModel.scene.children);
    // this.instance.add(districtModel.scene);
    const scale = 0.5;
    this.instance.position.set(-5, -5, 0);
    this.instance.scale.set(scale, scale, scale);
  }

  appear() {
    anime({
      targets: this.instance?.position,
      y: [-5, 0],
      x: [-5, 0],
      easing: "easeInOutQuart",
      // loop: true,
      // direction: "alternate",
      duration: 1000,
    });
    this.instance?.children.map((groupChild: Object3D) => {
      groupChild.children.map((modelChild) => {
        anime({
          targets: (modelChild as Mesh).material,
          opacity: [0, 1],
          easing: "easeInOutQuart",
          // loop: true,
          // direction: "alternate",
          duration: 1000,
        });
      });
    });
  }
  disappear() {
    anime({
      targets: this.instance?.position,
      y: [0, -5],
      x: [0, -5],
      easing: "easeInOutQuart",
      // loop: true,
      // direction: "alternate",
      duration: 1000,
    });
    console.log(this.instance);
    this.instance?.children.map((groupChild: Object3D) => {
      groupChild.children.map((modelChild) => {
        anime({
          targets: (modelChild as Mesh).material,
          opacity: [1, 0],
          easing: "easeInOutQuart",
          // loop: true,
          // direction: "alternate",
          duration: 1000,
        });
      });
    });
  }
}
