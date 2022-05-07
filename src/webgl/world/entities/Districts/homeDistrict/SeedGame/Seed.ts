import anime from "animejs";
import Experience from "@/webgl/Experience";
import {
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
  Scene,
  SphereGeometry,
  Mesh,
} from "three";

export default class Seed {
  private experience: Experience = new Experience();
  private camera: PerspectiveCamera = this.experience.camera
    ?.instance as PerspectiveCamera;
  private scene: Scene = this.experience.scene as Scene;
  private geometry: SphereGeometry | null = null;
  private material: MeshStandardMaterial | null = null;
  private mesh: Mesh | null = null;
  private isInit = false;
  private targetPoint: Vector3 | null = null;
  private shotAngle = 0;

  constructor() {}

  init() {
    if (!this.isInit) {
      this.geometry = new SphereGeometry(0.05, 16, 16);
      this.material = new MeshStandardMaterial({ color: 0xff0000 });
      this.mesh = new Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);
      this.resetPos();
      this.animeShot();
      this.isInit = true;
    }
  }

  shot(targetPoint: Vector3, angle: number) {
    this.shotAngle = angle;
    this.setTarget(targetPoint);
    if (!this.isInit) {
      this.init();
    } else {
      this.animeShot();
    }
  }

  animeShot() {
    if (this.mesh && this.targetPoint) {
      this.resetPos();
      console.log(this.mesh.position);
      const saveX = this.mesh?.position.x;
      anime({
        targets: this.mesh?.position,
        x: [this.mesh?.position.x, this.targetPoint.x],
        // y: [this.mesh?.position.y, this.targetPoint.y],
        z: [this.mesh?.position.z, this.targetPoint.z + 6],
        duration: 1400,
        easing: "linear",
        update: (anims) => {
          let x = saveX - parseFloat(anims.animations[0].currentValue);
          const newY = this.getHeight(x);
          console.log(newY);
          if (this.mesh && newY > 0) {
            this.mesh.position.y = newY;
            console.log(newY);
          }
        },
      });
    }
  }

  getHeight(x: number) {
    const gravity = 1;
    const speed = 0.7;
    const angle = this.shotAngle;
    const res =
      Math.tan(angle) * x -
      (1 / (2 * speed * Math.pow(Math.cos(angle), 2))) * Math.pow(x, 2);
    // console.log(res);
    return res;
  }

  getFinalX() {
    const gravity = 10;
    const speed = 0.5;
    const angle = Math.PI / 4;
    const x =
      (Math.pow(2 * speed, 2) *
        Math.pow(Math.cos(angle), 2) *
        Math.tan(angle)) /
      gravity;
    return x;
  }

  setTarget(targetPoint: Vector3) {
    if (this.targetPoint) {
      this.targetPoint.copy(targetPoint);
    } else {
      this.targetPoint = new Vector3().copy(targetPoint);
    }
  }

  resetPos() {
    if (this.mesh) {
      this.mesh.position.copy(this.camera.position);
      this.mesh.position.x += 0.5;
    }
  }
}
