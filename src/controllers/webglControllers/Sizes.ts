import EventEmitter from "@/controllers/globalControllers/EventEmitter";
export default class Sizes extends EventEmitter {
  public width = 0;
  public height = 0;
  public pixelRatio = 0;

  constructor() {
    super();

    this.resize();

    // Resize event
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.trigger("resize");
  }
}
