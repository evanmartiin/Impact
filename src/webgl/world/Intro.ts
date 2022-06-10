import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import { Vector3, Mesh, CatmullRomCurve3, MeshNormalMaterial, Object3D, PerspectiveCamera, TubeGeometry, Euler, Quaternion, AxesHelper, Matrix4, Spherical } from "three";
import signal from 'signal-js';
import type Sizes from "../controllers/Sizes";
import anime from "animejs";

export default class Intro {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private params = {
    firstPerson: false,
    displayCollider: true,
    displayBVH: true,
    visualizeDepth: 10,
    gravity: -10,
    playerSpeed: 10,
    physicsSteps: 5,
  };
  private geometry: TubeGeometry | null = null;
  private material: MeshNormalMaterial | null = null;
  private mesh: Mesh | null = null;
  private parent: Object3D | null = null;
  private camera: PerspectiveCamera | null = null;
  private position: Vector3 = new Vector3();
  private isIntroRunning: boolean = false;
  private startTime: number = 0;
  private baseCameraSpherical: Spherical | null = null;

  constructor() {
    signal.on("start_experience", () => this.start());

    this.setPath();
  }

  setPath() {
    const pipeSpline = new CatmullRomCurve3([
      new Vector3(0.82308394348547, 0.5, 0.40098479075095),
      new Vector3(0.82308394348547, 0.49239130434783, 0.36613802259126),
      new Vector3(0.80955245260884, 0.48478260869565, 0.21999802213577),
      new Vector3(0.77346790486263, 0.47717391304348, 0.05067822117326),
      new Vector3(0.69297160604492, 0.4695652173913, -0.11860707992309),
      new Vector3(0.58749369724774, 0.46195652173913, -0.26297977077502),
      new Vector3(0.49589446066148, 0.45434782608696, -0.36568194512893),
      new Vector3(0.33212612858279, 0.44673913043478, -0.49336572946231),
      new Vector3(0.17390926538792, 0.43913043478261, -0.5683105593962),
      new Vector3(0.01014093330923, 0.43152173913043, -0.59322316963971),
      new Vector3(-0.15640313321182, 0.42391304347826, -0.57108629383856),
      new Vector3(-0.29796558975522, 0.41630434782609, -0.51002013611378),
      new Vector3(-0.40899496743532, 0.40869565217391, -0.41009369620133),
      new Vector3(-0.50336993846395, 0.40108695652174, -0.28518564631122),
      new Vector3(-0.55610889286254, 0.39347826086957, -0.15472612753638),
      new Vector3(-0.57516992946512, 0.38586956521739, 0),
      new Vector3(-0.55610889286254, 0.37826086956522, 0.10064144112948),
      new Vector3(-0.4922670006963, 0.37065217391304, 0.21722228769431),
      new Vector3(-0.41177070187769, 0.36304347826087, 0.2921671176282),
      new Vector3(-0.32294719973288, 0.3554347826087, 0.3365788687006),
      new Vector3(-0.21191782205278, 0.34782608695652, 0.35600900979443),
      new Vector3(-0.11674172773837, 0.34021739130435, 0.32501307920666),
      new Vector3(-0.05902645785045, 0.33260869565217, 0.2723605522915),
    ]);
    this.material = new MeshNormalMaterial();
    this.geometry = new TubeGeometry(pipeSpline, 100, .01, 2, true);
    this.mesh = new Mesh(this.geometry, this.material);

    this.setCamera();
  }

  setCamera() {
    this.geometry?.parameters.path.getPointAt(0, this.position);
    const { x, y, z } = this.position;
    if (this.experience.activeCamera?.instance) {
      this.experience.activeCamera.instance.position.set(x, y, z);
      this.experience.activeCamera.instance.lookAt(0, 500, 0);

      const dummy = new Object3D();
      dummy.position.set(x, y, z);
      dummy.lookAt(0, .4, 0);
      this.baseCameraSpherical = new Spherical().setFromVector3(dummy.position.clone());

      const targetY = { value: 0 };
      const tl = anime.timeline({});
      tl.add(
        {
          targets: targetY,
          value: [500, .4],
          duration: 3000,
          easing: 'easeOutExpo',
          change: () => {
            this.experience.activeCamera?.instance?.lookAt(0, targetY.value, 0);
          },
          complete: () => {
            signal.emit("camera_ready");
            this.handleMouse();
          }
        },
        0
      );
    }
  }

  handleMouse() {
    signal.on("mouse_move", () => {
      if (this.experience.mouse && this.experience.activeCamera?.instance && this.baseCameraSpherical) {
        const shift = {
          x: this.experience.mouse.xCenterBase / this.sizes.width * .03,
          y: -this.experience.mouse.yCenterBase / this.sizes.height * .03
        }
        const spherical = new Spherical().setFromVector3(this.experience.activeCamera.instance.position);
        spherical.phi = this.baseCameraSpherical.phi + shift.y;
        spherical.theta = this.baseCameraSpherical.theta + shift.x;
        this.experience.activeCamera.instance.position.setFromSpherical(spherical);
        this.experience.activeCamera?.instance?.lookAt(0, .4, 0);
      }
    })
  }

  start() {
    this.startTime = this.time.elapsed;
    this.isIntroRunning = true;
    signal.off("mouse_move");
  }

  stop() {
    this.isIntroRunning = false;
    this.experience.world?.setControls();
    this.experience.world?.controls?.target.set(0, .3, 0);
  }

  update() {
    if (this.isIntroRunning) {
      const looptime = 5000;
      const t = (this.time.elapsed - this.startTime) / looptime;
      const easeInOut = t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      const easeBounce = (1 - (Math.cos(t * Math.PI * 2) * .5 + .5)) / 10;

      if (t <= 1) {
        this.geometry?.parameters.path.getPointAt(easeInOut, this.position);
        const { x, y, z } = this.position;
        this.experience.activeCamera?.instance?.position.set(x, y, z);
        this.experience.activeCamera?.instance?.lookAt(0, .4 - easeInOut/10, 0);
        this.experience.activeCamera?.instance?.rotateZ(Math.PI * easeBounce * easeInOut);
      } else {
        this.stop();
      }
    }
  }
}
