import Experience from "@/webgl/Experience";
import { Group, type Scene } from "three";
import type { district } from "./../../../../models/district.model";
import HomeDistrict from "./homeDistrict/HomeDistrict";

export default class Districts {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private instance: Group = new Group();
  private currentDistrict: district = "earth";
  public homeDistrict: HomeDistrict | null = null;

  constructor() {
    this.setModels();
  }

  setModels() {
    this.homeDistrict = new HomeDistrict();
    this.instance.add(this.homeDistrict.instance);
    this.scene.add(this.instance);
  }
  switchDistrict(district: district) {
    this.currentDistrict = district;
    switch (district) {
      case "earth":
        this.homeDistrict?.disappear();
        break;
      case "home":
        this.homeDistrict?.appear();
        break;
      default:
        this.homeDistrict?.disappear();
        break;
    }
  }
}
