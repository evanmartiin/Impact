import antiSpamClick from "@/utils/antiSpamClick";
import Experience from "@/webgl/Experience";
import type { Object3D } from "three";

class intersectionController {
  private experience: Experience = new Experience();
  private world = this.experience.world;
  constructor() {}
  dispatchInterAction = (modelName: string, object: Object3D) => {
    switch (modelName) {
      case "ville":
        this.cityClick();
        break;

      default:
        break;
    }
  };

  cityClick = antiSpamClick(() => {
    if (this.world && this.world.districts && this.world.currentScene) {
      this.world.earth?.disappear();
      this.world.districts?.switchDistrict("district1");
      this.world.currentScene = "district1";
    }
  }, 300);
}

export default intersectionController;
