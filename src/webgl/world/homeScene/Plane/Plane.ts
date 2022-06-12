import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import { CatmullRomCurve3, DoubleSide, Mesh, MeshMatcapMaterial, MeshNormalMaterial, Texture, TubeGeometry, Vector2, Vector3, type Scene } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import planeSettings from "./planeSettings";

export default class Plane {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private time: Time = this.experience.time as Time;
  private scene: Scene | null = null;

  static bigModel: GLTF | null = null;
  static mediumModel: GLTF | null = null;
  static smallModel: GLTF | null = null;

  private model: GLTF | null = null;
  private mesh: Mesh | null = null;

  private path: TubeGeometry | null = null;
  private startTime: number = 0;
  private position: Vector3 = new Vector3();
  private lookAt: Vector3 = new Vector3();

  constructor(scene: Scene) {
    this.scene = scene;
    this.setMesh();
    this.setPath();
  }

  setMesh() {
    this.model = this.loaders.items["plane-model"] as GLTF;
    this.model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        this.mesh = child;

        const matcap = this.loaders.items["plane-texture"] as Texture;
        const material = new MeshMatcapMaterial({ matcap: matcap, color: 0xffffff, side: DoubleSide });
        this.mesh.material = material;

        this.scene?.add(this.mesh);
        this.mesh.scale.set(.05, .05, .05);

        this.startTime = this.time.elapsed;
      }
    })
  }

  setPath() {
    this.path = new TubeGeometry(
      new CatmullRomCurve3(planeSettings.pipeSpline),
      100,
      0.01,
      2
    );
  }

  computeAngle(t: number) {
    const prevPosVec3 = new Vector3()
    const prevTime = (t - .02) % 1;
    this.path?.parameters.path.getPointAt(prevTime >= 0 ? prevTime : 0, prevPosVec3);

    const prevPos = new Vector2(prevPosVec3.x, prevPosVec3.z);
    const currentPos = new Vector2(this.position.x, this.position.z);
    const nextPos = new Vector2(this.lookAt.x, this.lookAt.z);

    const currentDirection = new Vector2().copy(currentPos).sub(prevPos).normalize();
    const nextDirection = new Vector2().copy(nextPos).sub(currentPos).normalize();
    let turnAngle = Math.acos(currentDirection.dot(nextDirection));
    const signAngle = currentDirection.cross(nextDirection) > 0;
    turnAngle *= signAngle ? 1 : -1;
    turnAngle *= .5;

    return turnAngle;
  }

  update() {
    const looptime = 15000;
    const t = ((this.time.elapsed - this.startTime) % looptime) / looptime;
    const easeBounce = (1 - (Math.cos(t * Math.PI * 2) * .5 + .5)) / 10;

    this.path?.parameters.path.getPointAt(t, this.position);
    this.path?.parameters.path.getPointAt((t + .02) % 1, this.lookAt);
    this.mesh?.position.copy(this.position);
    this.mesh?.lookAt(this.lookAt);
    this.mesh?.rotateZ(Math.PI * this.computeAngle(t));
  }
}
