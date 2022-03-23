import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group, type Scene } from "three";
import District1 from "./District1/district1";

export default class District {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private instance: Group = new Group();
  public district1: District1 | null = null;

  constructor() {
    this.setModels();
  }

  setModels() {
    this.district1 = new District1();
    this.instance.add(this.district1.instance);
    this.scene.add(this.instance);
  }
}
