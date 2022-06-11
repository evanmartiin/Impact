import Experience from "@/webgl/Experience";
import {
  SphereGeometry,
  Vector3,
  Scene,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from "three";

export default class Helper {
  private experience: Experience = new Experience();
  private camera: PerspectiveCamera = this.experience.world?.homeScene?.camera
    .instance as PerspectiveCamera;
  private scene: Scene | null = null;
  private geometry: SphereGeometry | null = null;
  private material: MeshStandardMaterial | null = null;
  public instance: Mesh | null = null;
  public cursor: Mesh | null = null;

  private targetPoint: Vector3 | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.init();
  }

  init() {
    this.geometry = new SphereGeometry(0.005, 16, 16);
    this.material = new MeshStandardMaterial({ color: 0xff0000 });
    this.instance = new Mesh(this.geometry, this.material);
    this.instance.position.set(0, 0, 0);
    // this.scene?.add(this.instance);
    this.cursor = new Mesh(this.geometry, this.material);
    this.cursor.position.set(0, 0, 0);
    // this.scene?.add(this.cursor);
  }

  setCursor(x: number, y: number, z: number) {
    this.cursor?.position.set(x, y, z);
  }

  set(pos: Vector3) {
    this.instance?.position.set(pos.x, pos.y, pos.z);
  }
}
