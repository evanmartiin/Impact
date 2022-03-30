import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import Earth from "./entities/Earth/Earth";
import Environment from "./Environment";

export default class World {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  protected environment: Environment | null = null;
  protected earth: Earth | null = null;

  constructor() {
    this.loaders.on("ready", () => {
      this.environment = new Environment();
      this.earth = new Earth();
    });
  }
  destroy() {
    this.environment?.destroy();
    this.earth?.destroy();
  }
}
