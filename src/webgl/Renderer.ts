import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  CineonToneMapping,
  Object3D,
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
  public intersects: Intersection[] = [];
  private districtNames: string[] = ["maison", "ville", "mamie"];
  public hoveredDistrict: Object3D | undefined;

  constructor() {
    this.setInstance();
  }

  setInstance() {
    const isRetinaScreen = window.devicePixelRatio > 1;
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: !isRetinaScreen,
      powerPreference: "high-performance",
    });
    // this.instance.physicallyCorrectLights = true;
    this.instance.outputEncoding = sRGBEncoding;
    this.instance.toneMapping = CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = PCFSoftShadowMap;
    this.instance.setClearColor("#0C1B51");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  resize() {
    this.instance?.setSize(this.sizes.width, this.sizes.height);
    this.instance?.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    if (this.camera.instance && this.instance) {
      this.instance.render(this.scene, this.camera.instance);
    }
  }

  raycast() {
    this.intersects = [];
    if (this.camera.instance && this.experience.world?.earth?.earthGroup) {
      this.raycaster.setFromCamera(
        this.mouse.mouseVector,
        this.camera.instance
      );
      switch (this.experience.world.currentScene) {
        case "earth":
          this.raycaster
            .intersectObjects(this.experience.world.earth.earthGroup.children)
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
          break;
        case "maison":
          let toRaycast: Object3D[] = [];
          if (this.experience.world.districts?.homeDistrict?.instance) {
            this.experience.world.districts.homeDistrict?.instance?.children.map(
              (object) => toRaycast.push(object)
            );

            this.experience.world.districts.homeDistrict.game?.targets?.instance.children.map(
              (object) => toRaycast.push(object)
            );

            this.raycaster.intersectObjects(toRaycast).map((object) => {
              this.intersects.push(object);
            });
          }
        default:
          break;
      }

      // let rt = new WebGLRenderTarget(this.sizes.width, this.sizes.height, { minFilter: LinearFilter, magFilter: NearestFilter });

      // let plane = new Mesh(
      //   new PlaneBufferGeometry(6, 4, 10, 10),
      //   new MeshBasicMaterial({ map: rt.texture, wireframe: true })
      // )
      // let rtScene = new Scene();
      // rtScene.add(plane);

      // this.instance?.setRenderTarget(rt);
      // this.instance?.render(this.scene, this.camera.instance);
      // this.instance?.setRenderTarget(null);
      this.instance?.render(this.scene, this.camera.instance);
    }
    return this.intersects;
  }
}
