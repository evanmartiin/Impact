import Experience from "@/webgl/Experience";
import {
  PlaneGeometry,
  Vector3,
  Scene,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from "three";

export default class Helper {
  private experience: Experience = new Experience();
  private camera: PerspectiveCamera = this.experience.camera?.instance as PerspectiveCamera;
  private scene: Scene | null = null;
  private geometry: PlaneGeometry | null = null;
  private material: MeshStandardMaterial | null = null;
  private instance: Mesh | null = null;
  private isInit = false;
  private isDisplayed = false;

  private targetPoint: Vector3 | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  init() {
    if (!this.isInit) {
      this.geometry = new PlaneGeometry(0.05, 16);
      this.material = new MeshStandardMaterial({ color: 0xff0000 });
      this.instance = new Mesh(this.geometry, this.material);
      this.scene?.add(this.instance);
      this.isInit = true;
      this.isDisplayed = true;
    }
  }

  appear() {
    if (!this.isInit) {
      this.init();
    } else if (!this.isDisplayed) {
      if (this.instance) this.instance.visible = true;
      this.isDisplayed = true;
    }
  }

  disappear() {
    if (this.isDisplayed) {
      if (this.instance) this.instance.visible = true;
      this.isDisplayed = false;
    }
  }
}
