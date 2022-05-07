import intersectionController from "@/webgl/controllers/IntersectionController";
import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  BoxBufferGeometry,
  CineonToneMapping,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  Object3D,
  PCFSoftShadowMap,
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
  public currentScene: Scene | null = null;
  public renderTargetScene: Scene | null = null;
  public renderTarget: WebGLRenderTarget | null = null;
  private isRenderTargetOn: boolean = false;

  constructor(scene: Scene) {
    this.currentScene = scene;

    this.setInstance();
  }

  setInstance() {
    const isRetinaScreen = window.devicePixelRatio > 1;
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: !isRetinaScreen,
      powerPreference: "high-performance"
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
          this.experience.world.earth.earthGroup.children
        )
        .map((object) => {
          this.intersects.push(object);
        });
        
        let selectedObjects = [];
        if (this.intersects.length > 0 && this.districtNames.includes(this.intersects[0].object.name)) {
          this.hoveredDistrict = this.intersects[0].object;
          selectedObjects.push(this.hoveredDistrict);
        } else {
          selectedObjects = this.experience.world.earth.earthGroup.children[0].children.filter((model) => this.districtNames.includes(model.name));
          this.hoveredDistrict = undefined;
        }
        if (this.isRenderTargetOn) {
          this.instance?.setRenderTarget(this.renderTarget);
          this.instance?.render(this.renderTargetScene as Scene, this.camera.instance);
          this.instance?.setRenderTarget(null);
        }
      this.instance?.render(this.currentScene as Scene, this.camera.instance);
    }
  }

  changeScene(nextScene: Scene) {
    this.renderTargetScene = this.currentScene;
    this.renderTarget = new WebGLRenderTarget(this.sizes.width*2, this.sizes.height*2, { minFilter: LinearFilter, magFilter: NearestFilter });
    this.isRenderTargetOn = true;

    if (this.renderTarget) {
      this.renderTarget.texture.encoding = sRGBEncoding;
    }
    const plane = new Mesh(new PlaneBufferGeometry(this.sizes.width/200, this.sizes.height/200), new MeshBasicMaterial({ map: this.renderTarget?.texture }));
    plane.lookAt(this.camera.instance?.position as Vector3);
    nextScene.add(plane);

    this.currentScene = nextScene;
  }
}
