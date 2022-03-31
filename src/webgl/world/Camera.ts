import type Sizes from "@/controllers/webglControllers/Sizes";
import { PerspectiveCamera, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "../Experience";

export default class Camera {
  private experience: Experience = new Experience();
  private sizes: Sizes = this.experience.sizes as Sizes;
  private scene: Scene = this.experience.scene as Scene;
  private canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  public instance: PerspectiveCamera | null = null;
  public controls: OrbitControls | null = null;

  constructor() {
    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    this.instance.position.set(0, 4, 6);

    this.scene.add(this.instance);
  }

  setControls() {
    if (this.instance && this.canvas) {
      this.controls = new OrbitControls(this.instance, this.canvas);
      this.controls.enableDamping = true;
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
    }
  }

  resize() {
    if (this.instance) {
      this.instance.aspect = this.sizes.width / this.sizes.height;
    }
    this.instance?.updateProjectionMatrix();
  }

  update() {
    this.controls?.update();
  }
}
