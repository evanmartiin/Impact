import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import {
  Vector3,
  TubeGeometry,
  Spherical,
  Scene,
  Camera,
} from "three";
import signal from "signal-js";
import type Sizes from "../../../controllers/Sizes";
import anime from "animejs";

export default class Outro {
  private experience: Experience = new Experience();

  private scene: Scene = this.experience.world?.earthScene?.scene as Scene;
  private camera: Camera = this.experience.world?.earthScene?.camera
    .instance as Camera;

  private startCamPos: Vector3 = new Vector3(500, 0, 0);
  private endingCamPos: Vector3 = new Vector3(10, 0, 0);
  private scoreboardCamPos: Vector3 = new Vector3(5, 2, 0);
  private creditsCamPos: Vector3 = new Vector3(15, 0, 0);
  private target: Vector3 = new Vector3();

  constructor() {
    signal.on("outro:start", () => this.start());
    signal.on("outro:scoreboard", () => this.scoreboard());
    signal.on("outro:credits", () => this.credits());
  }

  start() {
    this.camera.position.copy(this.startCamPos);
    this.camera.lookAt(0, 0, 0);

    const { x, y, z } = this.endingCamPos;
    const tl = anime.timeline({});
    tl.add(
      {
        targets: this.camera.position,
        x, y, z,
        duration: 3000,
        easing: "easeOutExpo"
      },
      0
    );
    tl.add(
      {
        targets: this.target,
        y: -1,
        duration: 3000,
        easing: "easeOutExpo",
        change: () => {
          this.camera.lookAt(0, this.target.y, 0);
        }
      },
      0
    );
    tl.add(
      {
        duration: 1500,
        complete: () => {
          signal.emit("outro:ending");
        }
      },
      0
    )
    tl.add(
      {
        duration: 2500,
        complete: () => {
          this.experience.world?.earthScene?.fire?.turnOn();
        }
      },
      0
    )
  }
  
  scoreboard() {
    const { x, y, z } = this.scoreboardCamPos;
    const tl = anime.timeline({});
    tl.add(
      {
        targets: this.camera.position,
        x, y, z,
        duration: 3000,
        easing: "easeInOutCubic"
      },
      0
    );
    tl.add(
      {
        targets: this.target,
        y: 2,
        duration: 3000,
        easing: "easeInOutCubic",
        change: () => {
          this.camera.lookAt(0, this.target.y, 0);
        }
      },
      0
    );
  }
  
  credits() {
    const { x, y, z } = this.creditsCamPos;
    const tl = anime.timeline({});
    tl.add(
      {
        targets: this.camera.position,
        x, y, z,
        duration: 3000,
        easing: "easeInOutCubic"
      },
      0
    );
    tl.add(
      {
        targets: this.target,
        y: -2.5,
        duration: 3000,
        easing: "easeInOutCubic",
        change: () => {
          this.camera.lookAt(0, this.target.y, 0);
        }
      },
      0
    );
  }

  update() {
    this.experience.world?.earthScene?.updateRelatedToCamera();
  }
}
