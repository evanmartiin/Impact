import intersectionController from "@/controllers/webglControllers/intertectionsActions";
import type Mouse from "@/controllers/webglControllers/Mouse";
import type Sizes from "@/controllers/webglControllers/Sizes";
import {
  CineonToneMapping,
  PCFSoftShadowMap,
  Raycaster,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
  type Intersection,
} from "three";
import Experience from "./Experience";
import type Camera from "./world/Camera";

export default class Renderer {
  private experience: Experience = new Experience();
  private canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private scene: Scene = this.experience.scene as Scene;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private camera: Camera = this.experience.camera as Camera;
  public instance: WebGLRenderer | null = null;
  public raycaster: Raycaster = new Raycaster();
  private intersects: Intersection[] = [];
  private intersectionController = new intersectionController();

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
    this.instance.setClearColor("#F9F7E8");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    this.mouse.on("click", () => this.IntersActions());
  }

  resize() {
    this.instance?.setSize(this.sizes.width, this.sizes.height);
    this.instance?.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  IntersActions() {
    this.intersectionController.dispatchInterAction(
      this.intersects[0].object.name,
      this.intersects[0].object
    );
  }

  update() {
    if (this.camera.instance && this.experience.world?.earth?.earthGroup) {
      this.raycaster.setFromCamera(
        this.mouse.mouseVector,
        this.camera.instance
      );
      this.intersects = [];
      this.raycaster
        .intersectObjects(
          this.experience.world.earth.earthGroup.children[0].children
        )
        .map((object) => {
          this.intersects.push(object);
        });

      this.instance?.render(this.scene, this.camera.instance);
    }
  }
}
