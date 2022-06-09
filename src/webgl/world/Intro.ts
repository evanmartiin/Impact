import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import { Vector3, Mesh, CatmullRomCurve3, MeshNormalMaterial, Object3D, PerspectiveCamera, TubeGeometry } from "three";
import signal from 'signal-js';

export default class Intro {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
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

  constructor() {
    signal.on("start_experience", () => this.start());

    this.setPath();
  }

  setPath() {
    const pipeSpline = new CatmullRomCurve3([
      new Vector3(0.82343112481885, 0.5, 0.36988768200445),
      new Vector3(0.80955245260884, 0.49204545454545, 0.21999802213577),
      new Vector3(0.77346790486263, 0.48409090909091, 0.05067822117326),
      new Vector3(0.69297160604492, 0.47613636363636, -0.11860707992309),
      new Vector3(0.58749369724774, 0.46818181818182, -0.26297977077502),
      new Vector3(0.49589446066148, 0.46022727272727, -0.36568194512893),
      new Vector3(0.33212612858279, 0.45227272727273, -0.49336572946231),
      new Vector3(0.17390926538792, 0.44431818181818, -0.5683105593962),
      new Vector3(0.01014093330923, 0.43636363636364, -0.59322316963971),
      new Vector3(-0.15640313321182, 0.42840909090909, -0.57108629383856),
      new Vector3(-0.29796558975522, 0.42045454545455, -0.51002013611378),
      new Vector3(-0.40899496743532, 0.4125, -0.41009369620133),
      new Vector3(-0.50336993846395, 0.40454545454545, -0.28518564631122),
      new Vector3(-0.55610889286254, 0.39659090909091, -0.15472612753638),
      new Vector3(-0.57516992946512, 0.38863636363636, 0),
      new Vector3(-0.55610889286254, 0.38068181818182, 0.10064144112948),
      new Vector3(-0.4922670006963, 0.37272727272727, 0.21722228769431),
      new Vector3(-0.41177070187769, 0.36477272727273, 0.2921671176282),
      new Vector3(-0.32294719973288, 0.35681818181818, 0.3365788687006),
      new Vector3(-0.21191782205278, 0.34886363636364, 0.35600900979443),
      new Vector3(-0.11674172773837, 0.34090909090909, 0.32501307920666),
      new Vector3(-0.05902645785045, 0.33295454545455, 0.2723605522915),
    ]);
    this.material = new MeshNormalMaterial();
    this.geometry = new TubeGeometry(pipeSpline, 100, .01, 2, true);
    this.mesh = new Mesh(this.geometry, this.material);

    this.setCamera();
  }

  setCamera() {
    this.geometry?.parameters.path.getPointAt(0, this.position);
    const { x, y, z } = this.position;
    this.experience.activeCamera?.instance?.position.set(x, y, z);
    this.experience.activeCamera?.instance?.lookAt(0, .4, 0);
  }

  start() {
    this.startTime = this.time.elapsed;
    this.isIntroRunning = true;
  }

  stop() {
    this.isIntroRunning = false;
    this.experience.world?.setControls();
    this.experience.world?.controls?.target.set(0, .3, 0);
    this.experience.world?.controls?.update();
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
