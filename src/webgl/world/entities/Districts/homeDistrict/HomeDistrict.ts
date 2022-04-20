import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import Character from "@/webgl/world/entities/Character/Character";

export default class HomeDistrict {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  public instance: Group = new Group();
  private character: Character = new Character();
  private isInit = false;
  private isDisplayed = false;

  constructor() {
    this.init();
  }

  init() {
    const districtModel = this.loaders.items["housev1"] as GLTF;
    this.instance.add(districtModel.scene);
    const scale = 0.2;
    this.instance.position.set(0, -20, 0);
    this.instance.scale.set(scale, scale, scale);
    this.instance.visible = false;
    this.isInit = true;
  }

  handleArrowDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
        this.character.walkLeft("down");
        break;
      case "ArrowRight":
        this.character.walkRight("down");
        break;
      case "ArrowUp":
        // Up pressed
        break;
      case "ArrowDown":
        // Down pressed
        break;
    }
  }

  handleArrowUp(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
        this.character.walkLeft("up");
        break;
      case "ArrowRight":
        this.character.walkRight("up");
        break;
      case "ArrowUp":
        // Up pressed
        break;
      case "ArrowDown":
        // Down pressed
        break;
    }
  }

  appear() {
    if (!this.isDisplayed) {
      const tl = anime.timeline({});
      tl.add({
        begin: () => {
          this.instance.visible = true;
          // this.instance.traverse((obj) => {
          //   if (obj.hasOwnProperty("geometry")) {
          //     obj.visible = true;
          //   }
          // });
        },
        targets: this.instance?.position,
        y: -0.2,
        easing: "easeInOutQuart",
        duration: 1000,
      });
      this.character.appear();
    }
    addEventListener("keydown", this.handleArrowDown);
    addEventListener("keyup", this.handleArrowUp);
  }
  disappear() {
    if (!this.isDisplayed) {
      const tl = anime.timeline({});
      tl.add({
        targets: this.instance?.position,
        y: [-0.2, -20],
        easing: "easeInOutQuart",
        duration: 1000,
        complete: () => {
          this.instance.visible = false;
          // this.instance.traverse((node) => {
          //   if (node.isMesh) {
          //     node.material.opacity = 0.5;
          //   }
          // });
          // this.instance.traverse((obj) => {
          //   if (obj.hasOwnProperty("geometry")) {
          //     obj.visible = false;
          //     obj.customDepthMaterial.opacity = 0;
          //   }
          // });
        },
      });
      this.character.disappear();
      removeEventListener("keydown", this.handleArrowDown);
      removeEventListener("keyup", this.handleArrowUp);
    }
  }
}
