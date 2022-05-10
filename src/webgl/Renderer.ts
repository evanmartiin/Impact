import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  CineonToneMapping,
  LinearFilter,
  Mesh,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Intersection,
} from "three";
import Experience from "./Experience";
import type Camera from "./world/Camera";

import vert from "./rtShaders/rtVertex.glsl?raw";
import frag from "./rtShaders/rtFragment.glsl?raw";
import type Time from "./controllers/Time";
import anime from "animejs";

export default class Renderer {
  private experience: Experience = new Experience();
  private canvas: HTMLCanvasElement = this.experience.canvas as HTMLCanvasElement;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private time: Time = this.experience.time as Time;
  public instance: WebGLRenderer | null = null;
  public raycaster: Raycaster = new Raycaster();
  public intersects: Intersection[] = [];
  private districtNames: string[] = ["maison", "ville", "mamie"];
  public hoveredDistrict: Object3D | undefined;
  public renderTargetScene: Scene | null = null;
  public renderTargetCamera: Camera | null = null;
  public renderTarget: WebGLRenderTarget | null = null;
  private rtMaterial: ShaderMaterial | null = null;
  private rtMaterialStartTime: number = 0;
  public isRenderTargetOn: boolean = false;
  private isCameraPosLocked: boolean = false;

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
      if (this.isRenderTargetOn && this.rtMaterial) {
        this.rtMaterial.uniforms.uTime.value = this.time.elapsed - this.rtMaterialStartTime;
        this.instance.setRenderTarget(this.renderTarget);
        this.instance.render(this.renderTargetScene as Scene, this.renderTargetCamera?.instance as PerspectiveCamera);
        this.instance.setRenderTarget(null);
      }
      if (this.experience.activeScene) {
        this.instance.render(this.experience.activeScene as Scene, this.experience.activeCamera?.instance);
      }
      if (this.isCameraPosLocked) {
        this.experience.world?.controls?.reset();
      }
    }
  }

  raycast() {
    this.intersects = [];
    if (this.experience.activeCamera?.instance && this.experience.world?.earth?.earthGroup) {
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

  changeScene(nextScene: Scene, nextCamera: Camera) {
    this.renderTargetScene = this.experience.activeScene;
    this.renderTargetCamera = this.experience.activeCamera;
    this.renderTarget = new WebGLRenderTarget(this.sizes.width*2, this.sizes.height*2, { minFilter: LinearFilter, magFilter: NearestFilter });
    this.isRenderTargetOn = true;

    if (this.renderTarget) {
      this.renderTarget.texture.encoding = sRGBEncoding;
    }

    this.rtMaterialStartTime = this.time.elapsed;
    this.rtMaterial = new ShaderMaterial({
      uniforms: {
        uSceneTexture: { value: this.renderTarget.texture },
        uPaperTexture: { value: this.experience.loaders?.items["paper-texture"] },
        uTime: { value: 0 },
        uEase: { value: 0 }
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true
    })
    const rtPlane = new Mesh(new PlaneBufferGeometry(this.sizes.width/200, this.sizes.height/200), this.rtMaterial);

    if (nextCamera.instance?.position) {
      rtPlane.lookAt(nextCamera.instance.position);
      rtPlane.position.copy(nextCamera.instance.position);
      const { x, y, z } = nextCamera.instance.position;
      const planePos = new Vector3(x, y, z).normalize().multiply(new Vector3(7.24, 7.24, 7.24));
      rtPlane.position.sub(planePos);
      nextScene.add(rtPlane);
    }

    // this.experience.activeCamera?.controls?.reset();
    // nextCamera.controls?.reset();

    this.experience.activeScene = nextScene;
    this.experience.activeCamera = nextCamera;
    if (this.experience.world?.controls) {
      this.experience.world.controls.object = nextCamera.instance as PerspectiveCamera;
      this.experience.world.controls.dampingFactor = 0;
    }
    this.isCameraPosLocked = true;
    this.experience.world?.controls?.saveState();

    const tl = anime.timeline({});
    tl.add(
      {
        targets: this.rtMaterial.uniforms.uEase,
        value: 1,
        duration: 2500,
        easing: 'easeInOutQuad'
      },
      0
    );

    setTimeout(() => {
      nextScene.remove(rtPlane);
      this.isRenderTargetOn = false;
    }, 2500);
    
    setTimeout(() => {
      if (this.experience.world?.controls) {
        this.experience.world.controls.dampingFactor = 0.05;
      }
      this.isCameraPosLocked = false;
    }, 2500);
  }
}
