import type Sizes from "@/controllers/webglControllers/Sizes";
import {
  CineonToneMapping,
  PCFSoftShadowMap,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import Experience from "./Experience";
import type Camera from "./world/Camera";

export default class Renderer {
  private experience: Experience = new Experience();
  private canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private scene: Scene = this.experience.scene as Scene;
  private camera: Camera = this.experience.camera as Camera;
  public instance: WebGLRenderer | null = null;

  constructor() {
    this.setInstance();
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.instance.physicallyCorrectLights = true;
    this.instance.outputEncoding = sRGBEncoding;
    this.instance.toneMapping = CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = PCFSoftShadowMap;
    this.instance.setClearColor("#211d20");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  resize() {
    this.instance?.setSize(this.sizes.width, this.sizes.height);
    this.instance?.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    if (this.camera.instance) {
      this.instance?.render(this.scene, this.camera.instance);
    }
  }
}
