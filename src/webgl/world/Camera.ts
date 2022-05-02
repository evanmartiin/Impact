import type Sizes from "@/webgl/controllers/Sizes";
import anime from "animejs";
import { PerspectiveCamera, Scene, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "../Experience";
import type Time from "@/webgl/controllers/Time";

export default class Camera {
  private experience: Experience = new Experience();
  private sizes: Sizes = this.experience.sizes as Sizes;
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  public instance: PerspectiveCamera | null = null;
  public controls: OrbitControls | null = null;

  private angle: number = 0;

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
      // this.controls.enableZoom = false;
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

  rotate(angle: number) {
    this.angle += angle;
    if (this.instance) {
      const newPos = new Vector3();
      newPos.x += Math.sin(this.angle)*6;
      newPos.y += .3;
      newPos.z += Math.cos(this.angle)*6;
      const tl = anime.timeline({});
      tl.add(
        {
          targets: this.instance.position,
          x: newPos.x,
          y: newPos.y,
          z: newPos.z,
          duration: 100
        },
        0
      );
    }
  }
}
