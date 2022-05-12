import type Sizes from "@/webgl/controllers/Sizes";
import anime from "animejs";
import { PerspectiveCamera, Scene, Vector3 } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "../Experience";

export default class Camera {
  private experience: Experience = new Experience();
  private sizes: Sizes = this.experience.sizes as Sizes;
  private canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  public instance: PerspectiveCamera | null = null;
  public controls: OrbitControls | null = null;

  private angle: number = 0;

  constructor(position: Vector3, scene: Scene) {
    this.setInstance(position, scene);
  }

  setInstance(position: Vector3, scene: Scene) {
    this.instance = new PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    this.instance.position.copy(position);
    scene.add(this.instance);
  }

  resize() {
    if (this.instance) {
      this.instance.aspect = this.sizes.width / this.sizes.height;
    }
    this.instance?.updateProjectionMatrix();
  }

  rotate(angle: number) {
    this.angle += angle;
    if (this.instance) {
      const newPos = new Vector3();
      newPos.x += Math.sin(this.angle) * 6;
      newPos.y += 0.3;
      newPos.z += Math.cos(this.angle) * 6;
      const tl = anime.timeline({});
      tl.add(
        {
          targets: this.instance.position,
          x: newPos.x,
          y: newPos.y,
          z: newPos.z,
          duration: 100,
        },
        0
      );
    }
  }
}
