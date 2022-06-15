import type Mouse from "@/webgl/controllers/Mouse";
import type Sizes from "@/webgl/controllers/Sizes";
import {
  CineonToneMapping,
  LinearFilter,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  sRGBEncoding,
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
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import Ashes from "./world/entities/Ashes/Ashes";
import signal from 'signal-js';

export default class Renderer {
  private experience: Experience = new Experience();
  public canvas: HTMLCanvasElement = this.experience
    .canvas as HTMLCanvasElement;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private time: Time = this.experience.time as Time;
  public instance: WebGLRenderer | null = null;
  public raycaster: Raycaster = new Raycaster();
  public intersects: Intersection[] = [];
  private districtNames: string[] = ["maison", "ville", "mamie"];
  public hoveredScene: Object3D | undefined;
  public renderTargetPrevScene: Scene | null = null;
  public renderTargetPrevCamera: Camera | null = null;
  public renderTargetPrev: WebGLRenderTarget | null = null;
  public renderTargetNextScene: Scene | null = null;
  public renderTargetNextCamera: Camera | null = null;
  public renderTargetNext: WebGLRenderTarget | null = null;
  private transitionStartTime: number = 0;
  public isTransitionOn: boolean = false;
  private isCameraPosLocked: boolean = false;
  private composer: EffectComposer | null = null;
  private shaderPass: ShaderPass | null = null;
  private then: number = 0;

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
    this.instance.outputEncoding = sRGBEncoding;
    this.instance.toneMapping = CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = PCFSoftShadowMap;
    this.instance.setClearColor("#0C1B51");
    // this.instance.setClearColor("#91caeb");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  resize() {
    this.instance?.setSize(this.sizes.width, this.sizes.height);
    this.instance?.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    const now = Date.now() * .001;
    const deltaTime = now - this.then;
    this.then = now;

    this.composer?.setSize(this.sizes.width, this.sizes.height);

    if (this.experience.activeCamera?.instance && this.instance) {
      if (this.isTransitionOn && this.shaderPass) {
        this.instance.setRenderTarget(this.renderTargetPrev);
        this.instance.render(this.renderTargetPrevScene as Scene, this.renderTargetPrevCamera?.instance as PerspectiveCamera);
        this.instance.setRenderTarget(this.renderTargetNext);
        this.instance.render(this.renderTargetNextScene as Scene, this.renderTargetNextCamera?.instance as PerspectiveCamera);
        this.instance.setRenderTarget(null);
        
        this.shaderPass.uniforms.uTime.value = this.time.elapsed - this.transitionStartTime;
        this.shaderPass.uniforms.tDiffuse1.value = this.renderTargetPrev?.texture;
        this.shaderPass.uniforms.tDiffuse2.value = this.renderTargetNext?.texture;
        this.shaderPass.uniforms.uPaperTexture.value = this.experience.loaders?.items["paper-texture"]; // dirty
      
        this.composer?.render(deltaTime);
      }
      else {
        this.instance.render(
          this.experience.activeScene as Scene,
          this.experience.activeCamera?.instance
        );
      }
      if (this.isCameraPosLocked) {
        this.experience.world?.controls?.reset();
      }
    }
  }

  raycast() {
    this.intersects = [];
    if (
      this.experience.activeCamera?.instance &&
      this.experience.world?.earthScene?.earthGroup
    ) {
      this.raycaster.setFromCamera(
        this.mouse.mouseVector,
        this.experience.activeCamera?.instance
      );
      switch (this.experience.world.currentScene) {
        case "earth":
          this.raycaster
            .intersectObjects(
              this.experience.world.earthScene.earthGroup.children
            )
            .forEach((object) => {
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
              this.experience.world.earthScene.earthGroup.children[0].children.filter(
                (model) => this.districtNames.includes(model.name)
              );
            this.hoveredScene = undefined;
          }
          break;
        case "maison":
          let toRaycast: Object3D[] = [];
          if (this.experience.world.homeScene?.instance) {
            this.experience.world.homeScene?.instance?.children.forEach((object) =>
              toRaycast.push(object)
            );

            this.raycaster.intersectObjects(toRaycast).forEach((object) => {
              this.intersects.push(object);
            });
          }
        default:
          break;
      }
      return this.intersects;
    }
  }

  changeScene(nextScene: Scene, nextCamera: Camera, setMaintenance?: boolean) {
    this.renderTargetPrevScene = this.experience.activeScene;
    this.renderTargetPrevCamera = this.experience.activeCamera;
    this.renderTargetPrev = new WebGLRenderTarget(this.sizes.width*2, this.sizes.height*2, { minFilter: LinearFilter, magFilter: NearestFilter });
    this.renderTargetNextScene = nextScene;
    this.renderTargetNextCamera = nextCamera;
    this.renderTargetNext = new WebGLRenderTarget(this.sizes.width*2, this.sizes.height*2, { minFilter: LinearFilter, magFilter: NearestFilter });
    this.isTransitionOn = true;

    if (this.renderTargetPrev) {
      this.renderTargetPrev.texture.encoding = sRGBEncoding;
      this.renderTargetNext.texture.encoding = sRGBEncoding;
    }

    this.transitionStartTime = this.time.elapsed;

    this.composer = new EffectComposer(this.instance as WebGLRenderer);
    this.composer.addPass(new RenderPass(this.renderTargetPrevScene as Scene, this.renderTargetPrevCamera?.instance as PerspectiveCamera));
    this.shaderPass = new ShaderPass({
      uniforms: {
        tDiffuse1: { value: null },
        tDiffuse2: { value: null },
        uPaperTexture: { value: this.experience.loaders?.items["paper-texture"] },
        uTime: { value: 0 },
        uEase: { value: 0 }
      },
      vertexShader: vert,
      fragmentShader: frag
    });
    this.shaderPass.material.transparent = true;
    this.shaderPass.renderToScreen = true;
    this.composer.addPass(this.shaderPass);

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
        targets: this.shaderPass.uniforms.uEase,
        value: 1,
        duration: 3500,
        easing: 'easeInOutQuad'
      },
      0
    );

    setTimeout(() => {
      if (this.experience.world?.controls) {
        this.experience.world.controls.dampingFactor = 0.05;
      }
      this.isCameraPosLocked = false;
      this.isTransitionOn = false;

      if (setMaintenance) {
        this.experience.world?.setMaintenance();
      }
    }, 3500);
  }
}
