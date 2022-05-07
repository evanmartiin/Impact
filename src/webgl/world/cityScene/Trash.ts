import Experience from "@/webgl/Experience";
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Object3D, Scene } from "three";

export default class Trash {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private geometry: BoxBufferGeometry = new BoxBufferGeometry(.3, .3, .3);
  private material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
  public mesh: Mesh | null;

  private row: "LEFT" | "CENTER" | "RIGHT" = "CENTER";

  constructor(scene: Scene) {
    this.scene = scene;

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(-.1, .6, 3.5);
    this.scene.add(this.mesh);

    addEventListener("keydown", this.handleArrowDown);
  }

  handleArrowDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      this.moveLeft();
    } else if (e.key === "ArrowRight") {
      this.moveRight();
    }
  }

  moveLeft() {
    if (this.mesh?.position.x) {
      if (this.row === "CENTER") {
        this.mesh.position.x = -.5;
        this.row = "LEFT";
      } else if (this.row === "RIGHT") {
        this.mesh.position.x = -.1;
        this.row = "CENTER";
      }
    }
  }

  moveRight() {
    if (this.mesh?.position.x) {
      if (this.row === "CENTER") {
        this.mesh.position.x = .3;
        this.row = "RIGHT";
      } else if (this.row === "LEFT") {
        this.mesh.position.x = -.1;
        this.row = "CENTER";
      }
    }
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene?.remove(this.mesh as Object3D);
  }
}
