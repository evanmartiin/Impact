import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import {
  Vector3,
  TubeGeometry,
  Spherical,
  Object3D,
  CatmullRomCurve3,
  Scene,
  Camera,
} from "three";
import signal from "signal-js";
import type Sizes from "../../../controllers/Sizes";
import introSettings from "./introSettings";
import anime from "animejs";

export default class Intro {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private sizes: Sizes = this.experience.sizes as Sizes;

  private scene: Scene = this.experience.world?.homeScene?.scene as Scene;
  private camera: Camera = this.experience.world?.homeScene?.camera
    .instance as Camera;

  private geometry: TubeGeometry | null = null;
  private position: Vector3 = new Vector3();
  private isIntroRunning: boolean = false;
  private startTime: number = 0;
  private baseCameraSpherical: Spherical | null = null;
  private verifCam: boolean = false;
  private nextCamPos: Vector3 = new Vector3();

  constructor() {
    signal.on("start_experience", () => this.start());
    // FIXME: pass to start

    this.setCamera();
  }

  setCamera() {
    const { x, y, z } = introSettings.pipeSpline[0];
    if (this.camera) {
      this.camera.position.set(x, y, z);
      this.camera.lookAt(0, 500, 0);

      const dummy = new Object3D();
      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0.1, 0);
      this.baseCameraSpherical = new Spherical().setFromVector3(
        dummy.position.clone()
      );

      const targetY = { value: 0 };
      const tl = anime.timeline({});
      tl.add(
        {
          targets: targetY,
          value: [500, 0.1],
          duration: 5000,
          easing: "easeOutExpo",
          change: () => {
            this.camera.lookAt(0, targetY.value, 0);
          },
          complete: () => {
            signal.emit("camera_ready");
            this.verifCam = true;
            this.nextCamPos =
              this.camera.position.clone() as Vector3;
            this.handleMouse();
          },
        },
        0
      );
    }
  }

  handleMouse() {
    signal.on("mouse_move", () => {
      if (
        this.experience.mouse &&
        this.camera &&
        this.baseCameraSpherical
      ) {
        const shift = {
          x: (this.experience.mouse.xCenterBase / this.sizes.width) * 0.03,
          y: (-this.experience.mouse.yCenterBase / this.sizes.height) * 0.03,
        };
        const spherical = new Spherical().setFromVector3(
          this.camera.position
        );
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
      this.camera.position.clone() as Vector3,
      ...introSettings.pipeSpline.slice(1),
    ];

    this.geometry = new TubeGeometry(
      new CatmullRomCurve3(points),
      100,
      0.01,
      2
    );

    this.isIntroRunning = true;
    this.startTime = this.time.elapsed;

    const sounds = this.experience.sound?.playMany(["button", "camera-intro"]);
    if (sounds) sounds[1].sound.on('end', () => this.experience.sound?.play("ambient-home"));
  }

  stop() {
    this.isIntroRunning = false;
    this.experience.world?.setControls();
    this.experience.world?.controls?.target.set(0, 0, 0);
    // FIXME: uncomment

    signal.off("mouse_move");
    this.verifCam = false;
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
        this.camera.position.set(x, y, z);
        this.camera.lookAt(
          0,
          0.1 - easeInOut / 10,
          0
        );
        this.camera.rotateZ(
          Math.PI * easeBounce * easeInOut
        );
      } else {
        this.stop();
      }
    }

    const distance =
      this.camera.position.distanceTo(
        this.nextCamPos
      ) as number;
    if (distance > 0.001 && this.verifCam) {
      const { x, y, z } = this.camera
        ?.position as Vector3;
      this.camera.position.set(
        x + (this.nextCamPos.x - x) * 0.1,
        y + (this.nextCamPos.y - y) * 0.1,
        z + (this.nextCamPos.z - z) * 0.1
      );
      this.camera.lookAt(0, 0.1, 0);
    }
  }
}
