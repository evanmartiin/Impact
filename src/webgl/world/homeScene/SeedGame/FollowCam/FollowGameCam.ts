import type Camera from "@/webgl/world/Camera";
import { Group } from "three";
import Cursor from "./Cursor/Cursor";

export default class FollowGameCam {
  private instance = new Group();
  private camera: Camera | null = null;
  private cursor: Cursor = new Cursor(this.instance);
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
    this.cursor.display();
    this.isFollowing = true;
  }

  hide() {
    this.cursor.hide();
    this.isFollowing = false;
  }

  update() {
    if (this.isFollowing) {
      this.cursor.update();
    }
  }
}
