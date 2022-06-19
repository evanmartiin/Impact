import type { IviewSizeAtDepth } from "@/types/webgl/sizes.model";
import getViewSizeAtDepth from "@/utils/getViewSizeAtDepth";
import Experience from "@/webgl/Experience";
import type { PerspectiveCamera } from "three";
import signal from 'signal-js';

export default class Sizes {
  public width = 0;
  public height = 0;
  public pixelRatio = 0;
  private experience: Experience = new Experience();
  public viewSizeAtDepth: IviewSizeAtDepth | null = null;

  constructor() {
    this.resize();

    // Resize event
    window.addEventListener("resize", () => this.resize());
  }

  setViewSizeAtDepth() {
    if (this.experience.activeCamera?.instance as PerspectiveCamera)
      this.viewSizeAtDepth = getViewSizeAtDepth(
        this.experience.activeCamera?.instance as PerspectiveCamera
      );
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.setViewSizeAtDepth();
    signal.emit("resize");
  }
}
