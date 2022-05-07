import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  CineonToneMapping,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  Object3D,
  PlaneBufferGeometry,
  Raycaster,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Intersection,
} from "three";
import Experience from "./Experience";
import type Camera from "./world/Camera";

export default class Renderer {
  private experience: Experience = new Experience();
  private canvas: HTMLCanvasElement = this.experience.canvas as HTMLCanvasElement;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private camera: Camera = this.experience.camera as Camera;
  public instance: WebGLRenderer | null = null;
  public raycaster: Raycaster = new Raycaster();
  public intersects: Intersection[] = [];
  private districtNames: string[] = ["maison", "ville", "mamie"];
  public hoveredDistrict: Object3D | undefined;
  public renderTargetScene: Scene | null = null;
  public renderTarget: WebGLRenderTarget | null = null;
  private isRenderTargetOn: boolean = false;

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
      if (this.isRenderTargetOn) {
        this.instance.setRenderTarget(this.renderTarget);
        this.instance.render(this.renderTargetScene as Scene, this.camera.instance);
        this.instance.setRenderTarget(null);
      }
      if (this.experience.activeScene) {
        this.instance.render(this.experience.activeScene as Scene, this.camera.instance);
      }
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
          if (this.experience.world.homeDistrict?.instance) {
            this.experience.world.homeDistrict?.instance?.children.map(
              (object) => toRaycast.push(object)
            );

            this.experience.world.homeDistrict.game?.targets?.instance.children.map(
              (object) => toRaycast.push(object)
            );

            this.raycaster.intersectObjects(toRaycast).map((object) => {
              this.intersects.push(object);
            });
          }
        default:
          break;
      }
      return this.intersects;
    }
  }

  changeScene(nextScene: Scene) {
    this.renderTargetScene = this.experience.activeScene;
    this.renderTarget = new WebGLRenderTarget(this.sizes.width*2, this.sizes.height*2, { minFilter: LinearFilter, magFilter: NearestFilter });
    this.isRenderTargetOn = true;

    if (this.renderTarget) {
      this.renderTarget.texture.encoding = sRGBEncoding;
    }
    const plane = new Mesh(new PlaneBufferGeometry(this.sizes.width/200, this.sizes.height/200), new MeshBasicMaterial({ map: this.renderTarget?.texture }));

    if (this.camera.instance?.position) {
      const camPos = new Vector3(
        this.camera.instance.position.x - 1,
        this.camera.instance.position.y - 1,
        this.camera.instance.position.z - 1
      );
      plane.lookAt(camPos);
      plane.position.copy(camPos);
      nextScene.add(plane);
    }

    setTimeout(() => {
      nextScene.remove(plane);
    }, 1000)

    this.experience.activeScene = nextScene;
  }
}
