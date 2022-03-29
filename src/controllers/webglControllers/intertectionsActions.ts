import Experience from "@/webgl/Experience";
import type { Object3D } from "three";

class intersectionController {
  private experience: Experience = new Experience();
  private world = this.experience.world;
  constructor() {}
  dispatchInterAction = (modelName: string, object: Object3D) => {
    switch (modelName) {
      case "ville":
        console.log("ville");
        console.log(this.world);
        if (this.world && this.world.districts && this.world.currentScene) {
          console.log("coucou");
          this.world.earth?.disappear();
          this.world.districts?.switchDistrict("district1");
          this.world.currentScene = "district1";
        }
        break;

      default:
        break;
    }
  };
}

export default intersectionController;
