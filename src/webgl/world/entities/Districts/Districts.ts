import Experience from "@/webgl/Experience";
import { Group, type Scene } from "three";
import type { district } from "./../../../../models/district.model";
import District1 from "./District1/district1";

export default class District {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private instance: Group = new Group();
  private currentDistrict: district = "earth";
  public district1: District1 | null = null;

  constructor() {
    this.setModels();
  }

  setModels() {
    this.district1 = new District1();
    this.instance.add(this.district1.instance);
    this.scene.add(this.instance);
  }
  switchDistrict(district: district) {
    this.currentDistrict = district;
    switch (district) {
      case "earth":
        this.district1?.disappear();
        break;
      case "district1":
        this.district1?.appear();
        break;
      default:
        this.district1?.disappear();
        break;
    }
  }
}
