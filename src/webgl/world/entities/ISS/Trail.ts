import Experience from "@/webgl/Experience";
import { Scene, Mesh, MeshBasicMaterial, Vector3, BoxBufferGeometry, Euler, Material, Group } from "three";

export default class Trail {
  private experience: Experience = new Experience();
  private trailsMeshes: Group = this.experience.world?.earth?.ISS?.trailsMeshes as Group;
  private trailsInstances: Trail[] = this.experience.world?.earth?.ISS?.trailsInstances as Trail[];

  static cooldown = 50;
  static lastInstance = 0;
  static geometry: BoxBufferGeometry = new BoxBufferGeometry(.05, .05, .05);
  private material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true });

  private mesh: Mesh | null = null;
  private lifespan: number = 0;
  private birth: number = Date.now();
  private position: Vector3 | null = null;
  private rotation: Euler | null = null;
  private scale: Vector3 | null = null;

  constructor(pos: Vector3) {
    this.lifespan = Math.random() * 500 + 500;
    this.position = new Vector3().copy(pos);
    this.rotation = new Euler(Math.random(), Math.random(), Math.random());
    const scale = Math.random() / 2 + .5;
    this.scale = new Vector3(scale, scale, scale);

    Trail.lastInstance = Date.now();

    this.setMesh();
  }

  setMesh() {
    this.mesh = new Mesh(Trail.geometry, this.material);
    if (this.position && this.rotation && this.scale) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.copy(this.rotation);
      this.mesh.scale.copy(this.scale);
    }
    this.trailsMeshes.add(this.mesh);
  }

  update() {
    const age = Date.now() - this.birth;
    if (age >= this.lifespan) {
      this.destroy();
    } else {
      if (this.mesh) {
        (this.mesh.material as Material).opacity = (this.lifespan - age) / this.lifespan;
      }
    }
  }

  destroy() {
    this.trailsMeshes.remove(this.mesh as Mesh);
    const index = this.trailsInstances.findIndex((el) => el === this);
    this.trailsInstances.splice(index, 1);
  }
}
