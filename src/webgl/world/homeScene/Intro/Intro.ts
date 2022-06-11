import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import {
  Vector3,
  Mesh,
  MeshNormalMaterial,
  Object3D,
  PerspectiveCamera,
  TubeGeometry,
  Spherical,
} from "three";
import signal from "signal-js";
import type Sizes from "../../../controllers/Sizes";
import introSettings from "./introSettings";

export default class Intro {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private sizes: Sizes = this.experience.sizes as Sizes;

  private geometry: TubeGeometry | null = null;
  private material: MeshNormalMaterial | null = null;
  private mesh: Mesh | null = null;
  private position: Vector3 = new Vector3();
  private isIntroRunning: boolean = false;
  private startTime: number = 0;
  private baseCameraSpherical: Spherical | null = null;

  constructor() {
    signal.on("start_experience", () => this.stop());

    this.setPath();
  }

  setPath() {
    this.material = new MeshNormalMaterial();
    this.geometry = new TubeGeometry(
      introSettings.pipeSpline,
      100,
      0.01,
      2,
      true
    );
    this.mesh = new Mesh(this.geometry, this.material);

    this.setCamera();
    this.handleMouse();
  }

  setCamera() {
    this.geometry?.parameters.path.getPointAt(0, this.position);
    const { x, y, z } = this.position;
    if (this.experience.activeCamera?.instance) {
      this.experience.activeCamera.instance.position.set(x, y, z);
      this.experience.activeCamera.instance.lookAt(0, 0.4, 0);
      this.baseCameraSpherical = new Spherical().setFromVector3(
        this.experience.activeCamera.instance.position.clone()
      );
    }
  }

  handleMouse() {
    signal.on("mouse_move", () => {
      if (
        this.experience.mouse &&
        this.experience.activeCamera?.instance &&
        this.baseCameraSpherical
      ) {
        const shift = {
          x: (this.experience.mouse.xCenterBase / this.sizes.width) * 0.03,
          y: (-this.experience.mouse.yCenterBase / this.sizes.height) * 0.03,
        };
        const spherical = new Spherical().setFromVector3(
          this.experience.activeCamera.instance.position
        );
        spherical.phi = this.baseCameraSpherical.phi + shift.y;
        spherical.theta = this.baseCameraSpherical.theta + shift.x;
        this.experience.activeCamera.instance.position.setFromSpherical(
          spherical
        );
        this.experience.activeCamera?.instance?.lookAt(0, 0.4, 0);
      }
    });
  }

  start() {
    this.startTime = this.time.elapsed;
    this.isIntroRunning = true;
    signal.off("mouse_move");
  }

  stop() {
    this.isIntroRunning = false;
    this.experience.world?.setControls();
    this.experience.world?.controls?.target.set(0, 0.3, 0);
    signal.off("mouse_move");
  }

  update() {
    if (this.isIntroRunning) {
      const looptime = 5000;
      const t = (this.time.elapsed - this.startTime) / looptime;
      const easeInOut =
        t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      const easeBounce = (1 - (Math.cos(t * Math.PI * 2) * 0.5 + 0.5)) / 10;

      if (t <= 1) {
        this.geometry?.parameters.path.getPointAt(easeInOut, this.position);
        const { x, y, z } = this.position;
        this.experience.activeCamera?.instance?.position.set(x, y, z);
        this.experience.activeCamera?.instance?.lookAt(
          0,
          0.4 - easeInOut / 10,
          0
        );
        this.experience.activeCamera?.instance?.rotateZ(
          Math.PI * easeBounce * easeInOut
        );
      } else {
        this.stop();
      }
    }
  }
}
