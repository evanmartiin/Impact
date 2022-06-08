import anime from "animejs";
import Experience from "@/webgl/Experience";
import {
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
  Vector2,
  Scene,
  SphereGeometry,
  Mesh,
  ArrowHelper,
} from "three";

export default class Seed {
  private experience: Experience = new Experience();
  private camera: PerspectiveCamera = this.experience.world?.homeScene?.camera
    .instance as PerspectiveCamera;
  private scene: Scene | null = null;
  private geometry: SphereGeometry | null = null;
  private material: MeshStandardMaterial | null = null;
  private mesh: Mesh | null = null;
  private isInit = false;
  private targetPoint: Vector3 | null = null;
  private cameraDirection: Vector3 = new Vector3();

  private isTravelling = false;
  private isVisible = false;
  private shotAngle = 0;
  private deltaMove = 0;
  private maxX = 0;
  private forPoint = new Vector3(0, 0, 30);
  private arrowCam: ArrowHelper | null = null;
  private arrowOri: ArrowHelper | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.geometry = new SphereGeometry(0.05, 16, 16);
    this.material = new MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.scene?.add(this.mesh);

    const dir = new Vector3(1, 2, 0);
    const origin = new Vector3(0, 0.8, 0.5);
    const length = 1;
    const hexCam = 0xffff00;
    const hexOri = 0xff0000;
    this.arrowCam = new ArrowHelper(dir, origin, length, hexCam);
    this.arrowOri = new ArrowHelper(dir, origin, length, hexOri);
    this.scene?.add(this.arrowCam);
    this.scene?.add(this.arrowOri);

    this.mesh.visible = false;
  }

  shot(targetPointX: number, angle: number, farPoint: number) {
    this.camera.getWorldDirection(this.cameraDirection);
    const newCamDirection = new Vector3().copy(this.cameraDirection);
    newCamDirection.x = 0;
    newCamDirection;
    this.arrowCam?.setDirection(newCamDirection);

    const baseDirection = new Vector3().copy(this.forPoint);
    this.arrowOri?.setDirection(baseDirection);
    // const baseDirectionV2 = new Vector2(baseDirection.y, baseDirection.z);

    const angled = baseDirection.angleTo(newCamDirection);
    console.log(angled);
    // console.log(this.cameraDirection);

    if (!this.isTravelling && this.mesh) {
      this.isTravelling = true;
      const hypothenuse = Math.sqrt(
        Math.pow(Math.abs(targetPointX), 2) + Math.pow(farPoint, 2)
      );
      this.shotAngle = angle;
      this.resetPos();
      this.mesh.visible = true;
      this.deltaMove = Math.abs(targetPointX) / 100;
      this.maxX = targetPointX;
      // this.animeShot();
    }
  }

  animeShot() {
    if (this.mesh && this.targetPoint) {
      this.resetPos();
      // const saveX = this.mesh?.position.x;
      // anime({
      //   targets: this.mesh?.position,
      //   x: [this.mesh?.position.x, this.targetPoint.x],
      //   // y: [this.mesh?.position.y, this.targetPoint.y],
      //   z: [this.mesh?.position.z, this.targetPoint.z + 6],
      //   duration: 1400,
      //   easing: "linear",
      //   update: (anims) => {
      //     let x = saveX - parseFloat(anims.animations[0].currentValue);
      //     const newY = this.getHeight(x);
      //     if (this.mesh && newY > 0) {
      //       this.mesh.position.y = newY;
      //     }
      //   },
      // });
    }
  }

  getHeight(x: number) {
    const gravity = 1;
    const speed = 0.7;
    const angle = this.shotAngle;
    const res =
      Math.tan(angle) * x -
      (gravity / (2 * speed * Math.pow(Math.cos(angle), 2))) * Math.pow(x, 2);
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
    }
  }

  moveModelX() {
    if (this.maxX > 0) {
      if (this.mesh && this.mesh.position.x < this.maxX)
        this.mesh.position.x += this.deltaMove;
    } else {
      if (this.mesh && this.mesh.position.x > this.maxX)
        this.mesh.position.x += this.deltaMove;
    }
  }

  update() {
    if (this.isTravelling && this.mesh) {
      this.mesh.position.z += 0.02;
      this.moveModelX();
      if (this.mesh?.position.z > 30) {
        this.isTravelling = false;
      }
    }
  }
}
