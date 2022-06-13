import type Camera from "@/webgl/world/Camera";
import { Group } from "three";

export default class FollowGameCam {
  private instance = new Group();
  private camera: Camera | null = null;
  private isFollowing = false;

  constructor(camera: Camera) {
    this.camera = camera;
    this.init();
  }
  private init() {
    this.camera?.instance?.add(this.instance);
    this.display();
  }

  display() {
    this.isFollowing = true;
  }

  hide() {
    this.isFollowing = false;
  }

  update() {
    if (this.isFollowing) {
    }
  }
}
