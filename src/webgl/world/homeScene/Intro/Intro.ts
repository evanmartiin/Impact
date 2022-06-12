import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import {
  Vector3,
  TubeGeometry,
  Spherical,
  Object3D,
  CatmullRomCurve3,
  MeshNormalMaterial,
  Mesh,
} from "three";
import signal from "signal-js";
import type Sizes from "../../../controllers/Sizes";
import introSettings from "./introSettings";
import anime from "animejs";

export default class Intro {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private sizes: Sizes = this.experience.sizes as Sizes;

  private geometry: TubeGeometry | null = null;
  private position: Vector3 = new Vector3();
  private isIntroRunning: boolean = false;
  private startTime: number = 0;
  private baseCameraSpherical: Spherical | null = null;
  private verifCam: boolean = false;
  private nextCamPos: Vector3 = new Vector3();

  constructor() {
    signal.on("start_experience", () => this.start());

    this.setCamera();
  }

  setCamera() {
    const { x, y, z } = introSettings.pipeSpline[0];
    if (this.experience.activeCamera?.instance) {
      this.experience.activeCamera.instance.position.set(x, y, z);
      this.experience.activeCamera.instance.lookAt(0, 500, 0);

      const dummy = new Object3D();
      dummy.position.set(x, y, z);
      dummy.lookAt(0, .1, 0);
      this.baseCameraSpherical = new Spherical().setFromVector3(dummy.position.clone());

      const targetY = { value: 0 };
      const tl = anime.timeline({});
      tl.add(
        {
          targets: targetY,
          value: [500, .1],
          duration: 5000,
          easing: 'easeOutExpo',
          change: () => {
            this.experience.activeCamera?.instance?.lookAt(0, targetY.value, 0);
          },
          complete: () => {
            signal.emit("camera_ready");
            this.verifCam = true;
            this.nextCamPos = this.experience.activeCamera?.instance?.position.clone() as Vector3;
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
        this.nextCamPos.setFromSpherical(spherical);
      }
    });
  }

  start() {
    signal.off("mouse_move");
    this.verifCam = false;

    const points = [
      this.experience.activeCamera?.instance?.position.clone() as Vector3,
      ...introSettings.pipeSpline.slice(1)
    ];

    this.geometry = new TubeGeometry(
      new CatmullRomCurve3(points),
      100,
      0.01,
      2
    );

    this.isIntroRunning = true;
    this.startTime = this.time.elapsed;
  }

  stop() {
    this.isIntroRunning = false;
    this.experience.world?.setControls();
    this.experience.world?.controls?.target.set(0, 0, 0);
    signal.off("mouse_move");
    this.verifCam = false;
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
        this.experience.activeCamera?.instance?.lookAt(0, .1 - easeInOut/10, 0);
        this.experience.activeCamera?.instance?.rotateZ(Math.PI * easeBounce * easeInOut);
      } else {
        this.stop();
      }
    }

    const distance = this.experience.activeCamera?.instance?.position.distanceTo(this.nextCamPos) as number;
    if (distance > 0.001 && this.verifCam) {
      const { x, y, z } = this.experience.activeCamera?.instance?.position as Vector3;
      this.experience.activeCamera?.instance?.position.set(
        x + (this.nextCamPos.x - x) * .1,
        y + (this.nextCamPos.y - y) * .1,
        z + (this.nextCamPos.z - z) * .1
      );
      this.experience.activeCamera?.instance?.lookAt(0, .1, 0);
    }
  }
}
