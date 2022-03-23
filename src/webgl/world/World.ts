import type Debug from "@/controllers/globalControllers/Debug";
import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type { FolderApi } from "tweakpane";
import Districts from "./entities/Districts/Districts";
import Earth from "./entities/Earth/Earth";
import Environment from "./Environment";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected environment: Environment | null = null;
  protected earth: Earth | null = null;
  protected districts: Districts | null = null;
  private debugFolder: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  private currentScene: "earth" | "district1" = "earth";

  constructor() {
    this.loaders.on("ready", () => {
      this.environment = new Environment();
      this.earth = new Earth();
      this.districts = new Districts();
      this.setDebug();
    });
  }
  update() {
    this.environment?.update();
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });
    const toggleScene = this.debugFolder?.addButton({
      title: "Toggle Scene",
    });
    if (this.districts?.district1 && this.earth) {
      toggleScene?.on("click", () => {
        if (this.currentScene === "earth") {
          this.districts?.district1?.appear();
          this.earth?.disappear();
          this.currentScene = "district1";
        } else {
          this.earth?.appear();
          this.districts?.district1?.disappear();
          this.currentScene = "earth";
        }
      });
    }
  }

  destroy() {
    this.environment?.destroy();
    this.earth?.destroy();
  }
}
