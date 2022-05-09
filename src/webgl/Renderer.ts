import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  CineonToneMapping,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
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
  private mouse: Mouse = this.experience.mouse as Mouse;
  public instance: WebGLRenderer | null = null;
  public raycaster: Raycaster = new Raycaster();
  public intersects: Intersection[] = [];
  private districtNames: string[] = ["house", "city", "grandma"];
  public hoveredScene: Object3D | undefined;
  public renderTargetScene: Scene | null = null;
  public renderTargetCamera: Camera | null = null;
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
    if (this.experience.activeCamera?.instance && this.instance) {
      if (this.isRenderTargetOn) {
        this.instance.setRenderTarget(this.renderTarget);
        this.instance.render(
          this.renderTargetScene as Scene,
          this.renderTargetCamera?.instance as PerspectiveCamera
        );
        this.instance.setRenderTarget(null);
      }
      if (this.experience.activeScene) {
        this.instance.render(
          this.experience.activeScene as Scene,
          this.experience.activeCamera?.instance
        );
      }
    }
  }

  raycast() {
    this.intersects = [];
    if (
      this.experience.activeCamera?.instance &&
      this.experience.world?.earth?.earthGroup
    ) {
      this.raycaster.setFromCamera(
        this.mouse.mouseVector,
        this.experience.activeCamera?.instance
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
            this.hoveredScene = this.intersects[0].object;
            selectedObjects.push(this.hoveredScene);
          } else {
            selectedObjects =
              this.experience.world.earth.earthGroup.children[0].children.filter(
                (model) => this.districtNames.includes(model.name)
              );
            this.hoveredScene = undefined;
          }
          break;
        case "house":
          let toRaycast: Object3D[] = [];
          if (this.experience.world.homeScene?.instance) {
            this.experience.world.homeScene?.instance?.children.map((object) =>
              toRaycast.push(object)
            );

            this.experience.world.homeScene.game?.targets?.instance.children.map(
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

  changeScene(nextScene: Scene, nextCamera: Camera) {
    this.renderTargetScene = this.experience.activeScene;
    this.renderTargetCamera = this.experience.activeCamera;
    this.renderTarget = new WebGLRenderTarget(
      this.sizes.width * 2,
      this.sizes.height * 2,
      { minFilter: LinearFilter, magFilter: NearestFilter }
    );
    this.isRenderTargetOn = true;

    if (this.renderTarget) {
      this.renderTarget.texture.encoding = sRGBEncoding;
    }

    const plane = new Mesh(
      new PlaneBufferGeometry(this.sizes.width / 200, this.sizes.height / 200),
      new MeshBasicMaterial({ map: this.renderTarget?.texture })
    );
    if (nextCamera.instance?.position) {
      plane.lookAt(nextCamera.instance.position);
      plane.position.copy(nextCamera.instance.position);
      const { x, y, z } = nextCamera.instance.position;
      const planePos = new Vector3(x, y, z)
        .normalize()
        .multiply(new Vector3(7.4, 7.4, 7.4));
      plane.position.sub(planePos);
      nextScene.add(plane);
    }

    setTimeout(() => {
      nextScene.remove(plane);
      this.isRenderTargetOn = false;
    }, 1000);

    this.experience.activeScene = nextScene;
    this.experience.activeCamera = nextCamera;
  }
}
