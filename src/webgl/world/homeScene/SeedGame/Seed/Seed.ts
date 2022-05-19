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
  private targetPoint: Vector3 | null = null;
  private cameraDirection: Vector3 = new Vector3();
  private zValue = 0;
  private isTravelling = false;
  private shotAngle = 0;
  private deltaMove = 0;
  private maxX = 0;
  private farPointRef = new Vector3(0, 0, 30);
  private arrowCam: ArrowHelper | null = null;
  private arrowOri: ArrowHelper | null = null;
  private origin = new Vector3(0, 0.8, 0.5);
  private xzDirection = new Vector2(0, 0);
  private ballDirection = new Vector3(0, 0, 0);

  constructor(scene: Scene) {
    this.scene = scene;
    this.geometry = new SphereGeometry(0.05, 16, 16);
    this.material = new MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new Mesh(this.geometry, this.material);
    this.resetPos();
    this.scene?.add(this.mesh);

    const dir = new Vector3(1, 2, 0);
    const length = 1;
    const hexCam = 0xffff00;
    const hexOri = 0xff0000;
    this.arrowCam = new ArrowHelper(dir, this.origin, length, hexCam);
    this.arrowOri = new ArrowHelper(dir, this.origin, length, hexOri);
    this.scene?.add(this.arrowCam);
    this.scene?.add(this.arrowOri);

    this.mesh.visible = false;
  }

  shot(targetPointX: number, angle: number, farPoint: number) {
    if (this.mesh) this.mesh.visible = true;
    this.camera.getWorldDirection(this.cameraDirection);
    console.log(this.cameraDirection);
    this.xzDirection.set(this.cameraDirection.x, this.cameraDirection.z);
    const newCamDirection = new Vector3().copy(this.cameraDirection);
    newCamDirection.x = 0;
    this.arrowCam?.setDirection(newCamDirection);
    const baseDirection = new Vector3().copy(this.farPointRef);
    this.arrowOri?.setDirection(baseDirection);
    if(this.cameraDirection.y > 0){
      this.shotAngle = baseDirection.angleTo(newCamDirection) + Math.PI / 6;
    }else{
      this.shotAngle = Math.PI / 6 - baseDirection.angleTo(newCamDirection);
    }
    
    this.zValue = 0;
    this.resetPos();
    this.isTravelling = true;
  }

  getHeight(x: number) {
    const gravity = 1;
    const speed = 5;
    const angle = this.shotAngle;
    const res =
      Math.tan(angle) * x -
      (gravity / (2 * speed * Math.pow(Math.cos(angle), 2))) * Math.pow(x, 2);
    return res;
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
      this.mesh.position.copy(this.origin);
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
      this.mesh.position.y = this.getHeight(this.zValue * 5);
      this.zValue += 0.01;
      this.mesh.position.x += this.xzDirection.normalize().x * 0.07;
      this.mesh.position.z += this.xzDirection.normalize().y * 0.07;
      this.moveModelX();
      if (this.mesh?.position.z > 30) {
        this.isTravelling = false;
      }
    }
  }
}
