import intersectionController from "@/webgl/controllers/IntersectionController";
import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  CineonToneMapping,
  Color,
  Object3D,
  PCFSoftShadowMap,
  Raycaster,
  Scene,
  sRGBEncoding,
  Vector2,
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
  private districtNames: string[] = ["maison", "ville", "mamie"];
  public hoveredDistrict: Object3D | undefined;

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
    this.instance.setClearColor("#0C1B51");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    this.mouse.on("click", () => this.IntersActions());
  }

  resize() {
    this.instance?.setSize(this.sizes.width, this.sizes.height);
    this.instance?.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  IntersActions() {
    if (this.intersects.length > 0) {
      this.intersectionController.dispatchInterAction(
        this.intersects[0].object.name,
        this.intersects[0].object
      );
    }
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

      let selectedObjects = [];
      if (
        this.intersects.length > 0 &&
        this.districtNames.includes(this.intersects[0].object.name)
      ) {
        this.hoveredDistrict = this.intersects[0].object;
        selectedObjects.push(this.hoveredDistrict);
      } else {
        selectedObjects =
          this.experience.world.earth.earthGroup.children[0].children.filter(
            (model) => this.districtNames.includes(model.name)
          );
        this.hoveredDistrict = undefined;
      }

      this.instance?.render(this.scene, this.camera.instance);
    }
  }
}
