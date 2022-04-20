
import type { FolderApi } from "tweakpane";
import type Debug from "../controllers/Debug";
import EventEmitter from "../controllers/EventEmitter";
import Experience from "../Experience";

export default class Toolbox extends EventEmitter {
  private experience: Experience = new Experience();
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;

  public ownedTools: string[] = [];

  constructor() {
    super();

    this.setDebug();
  }

  add(tool: string) {
    if (!this.ownedTools.includes(tool)) {
      this.ownedTools.push(tool);
      this.trigger('tool_added', [tool]);
    }
  }

  remove(tool: string) {
    if (this.ownedTools.includes(tool)) {
      const index = this.ownedTools.findIndex((el) => el === tool);
      this.ownedTools.splice(index, 1);
      this.trigger('tool_removed', [tool]);
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Toolbox" });

      const addPhone = this.debugFolder?.addButton({
        title: "Add Phone",
      });
      addPhone?.on("click", () => {
        this.add("Phone");
      });

      const addBike = this.debugFolder?.addButton({
        title: "Add Bike",
      });
      addBike?.on("click", () => {
        this.add("Bike");
      });

      const removePhone = this.debugFolder?.addButton({
        title: "Remove Phone",
      });
      removePhone?.on("click", () => {
        this.remove("Phone");
      });

      const removeBike = this.debugFolder?.addButton({
        title: "Remove Bike",
      });
      removeBike?.on("click", () => {
        this.remove("Bike");
      });
    }
  }
}
