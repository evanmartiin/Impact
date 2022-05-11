import EventEmitter from "@/webgl/controllers/EventEmitter";
import type Sizes from "@/webgl/controllers/Sizes";
import Experience from "@/webgl/Experience";
import { Vector2 } from "three";

export default class Mouse extends EventEmitter {
  private experience = new Experience();
  private sizes: Sizes | null = this.experience.sizes;
  public top = 0;
  public left = 0;
  public xCenterBase = 0;
  public yCenterBase = 0;
  public webglX = 0;
  public webglY = 0;
  public isInScreen = false;
  public speedX = 0;
  public speedY = 0;
  public mouseVector = new Vector2();
  public mouseInertia = new Vector2();
  private mouseClicking: Boolean = false;
  public mouseMoveEvent: null | MouseEvent = null;

  constructor() {
    super();

    //Mouse event
    window.addEventListener("mousemove", (e) => this.update(e));
    document.addEventListener("mouseenter", () => this.setIsInScreen(true));
    document.addEventListener("mouseleave", () => this.setIsInScreen(false));
    document.addEventListener("mouseleave", () => this.setIsInScreen(false));
    document.addEventListener("mousedown", () => {
      this.mouseClicking = true;
      this.trigger("mousedown");
    });
    document.addEventListener("mouseup", () => {
      this.mouseClicking = false;
      this.trigger("mouseup");
    });
  }

  update(e: globalThis.MouseEvent) {
    this.mouseMoveEvent = e;
    if (this.mouseClicking) {
      this.trigger("mousegrab");
    }
    this.top = e.clientY;
    this.left = e.clientX;
    const newMouseVector = new Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    this.mouseInertia.x = this.mouseVector.x - newMouseVector.x;
    this.mouseInertia.y = this.mouseVector.y - newMouseVector.y;

    this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (e.clientX < window.innerWidth / 2) {
      this.xCenterBase = -(window.innerWidth / 2 - e.clientX);
    } else {
      this.xCenterBase = e.clientX - window.innerWidth / 2;
    }

    if (e.clientY < window.innerHeight / 2) {
      this.yCenterBase = window.innerHeight / 2 - e.clientY;
    } else {
      this.yCenterBase = -(e.clientY - window.innerHeight / 2);
    }
    if (this.sizes?.viewSizeAtDepth) {
      this.webglX =
        (this.sizes.viewSizeAtDepth?.width * this.xCenterBase) /
        window.innerWidth;
      this.webglY =
        (this.sizes.viewSizeAtDepth?.height * this.yCenterBase) /
        window.innerHeight;
    }
    if (this.isInScreen === false) this.setIsInScreen(true);
    this.trigger("mousemove");
  }

  setIsInScreen(state: boolean) {
    this.trigger("mouseSwitch");
    if (state) {
      this.trigger("mouseEnter");
    } else {
      this.trigger("mouseLeave");
    }
    this.isInScreen = state;
  }

  destroy() {
    window.removeEventListener("mousemove", (e) => this.update(e));
    document.removeEventListener("mouseenter", () => this.setIsInScreen(true));
    document.removeEventListener("mouseleave", () => this.setIsInScreen(false));
  }
}
