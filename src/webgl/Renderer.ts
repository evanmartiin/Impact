import intersectionController from "@/controllers/webglControllers/intertectionsActions";
import type Mouse from "@/controllers/webglControllers/Mouse";
import type Sizes from "@/controllers/webglControllers/Sizes";
import {
  CineonToneMapping,
  Color,
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
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

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

  private composer: EffectComposer | undefined;
  private outlinePass: OutlinePass | undefined;
  private districtNames: string[] = ["maison", "ville", "mamie"];

  constructor() {
    this.setInstance();
    this.setOutlines();
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
        
        if (this.outlinePass) {
          let selectedObjects = [];
          if (this.intersects.length > 0 && this.districtNames.includes(this.intersects[0].object.name)) {
            this.outlinePass.edgeStrength = 3;
            selectedObjects.push(this.intersects[0].object);
          } else {
            this.outlinePass.edgeStrength = 1.5;
            selectedObjects = this.experience.world.earth.earthGroup.children[0].children.filter((model) => this.districtNames.includes(model.name));
          }
          this.outlinePass.selectedObjects = selectedObjects;
        }
        
      // this.instance?.render(this.scene, this.camera.instance);
      this.composer?.render();
    }
  }

  setOutlines() {
    if (this.instance && this.camera.instance) {
      this.composer = new EffectComposer(this.instance);

      const renderPass = new RenderPass(this.scene, this.camera.instance);
      this.composer.addPass(renderPass);

      this.outlinePass = new OutlinePass(new Vector2(this.sizes.width, this.sizes.height), this.scene, this.camera.instance);
      this.outlinePass.visibleEdgeColor = new Color("#ffffff");
      this.outlinePass.edgeStrength = 1.5;
      this.composer.addPass(this.outlinePass);

      const effectFXAA = new ShaderPass(FXAAShader);
      effectFXAA.uniforms['resolution'].value.set(1/this.sizes.width, 1/this.sizes.height);
      this.composer.addPass(effectFXAA);
    }
  }
}
