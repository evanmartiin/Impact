import Experience from "@/webgl/Experience";
import vert from './trailShaders/vert.glsl?raw'
import frag from './trailShaders/frag.glsl?raw'
import { Vector3, InstancedBufferGeometry, InstancedBufferAttribute, Scene, Float32BufferAttribute, AdditiveBlending, Points, type IUniform } from "three";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";

export default class Trail {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private debug: Debug = this.experience.debug as Debug;
  private debugTab: FolderApi | undefined = undefined;

  private geometry: InstancedBufferGeometry | null = null;
  private material: ShaderBaseMaterial | null = null;

  public mesh: Points | null = null;

  private PARAMS: any = {
    'ISSPosition': new Vector3(),
    'radiusFromEarth': 1,
    'instancesCount': 90,
    'spreadRatio': .05,
    'scaleMin': 15,
    'scaleMax': 20,
    'speed': .4,
    'blending': true
  }

  private positionsArray: Float32Array | null = null;
  private positionsAttribute: InstancedBufferAttribute | null = null;
  
  private paramsArray: Float32Array | null = null;
  private paramsAttribute: InstancedBufferAttribute | null = null;

  constructor(ISSPosition: Vector3, radiusFromEarth: number, scene: Scene) {
    this.scene = scene;

    this.PARAMS.ISSPosition = ISSPosition;
    this.PARAMS.radiusFromEarth = radiusFromEarth;

    this.setGeometry();
    this.setMaterial(ISSPosition, radiusFromEarth);
    this.setMesh();

    if (this.mesh) this.scene.add(this.mesh);

    this.setDebug();
  }

  setGeometry() {
    this.geometry = new InstancedBufferGeometry();
    this.geometry.instanceCount = this.PARAMS.instancesCount;
    this.geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3)); // Base geometry vertices positions

    this.positionsArray = new Float32Array(this.PARAMS.instancesCount * 3);
    this.paramsArray = new Float32Array(this.PARAMS.instancesCount * 3);

    this.positionsAttribute = new InstancedBufferAttribute(this.positionsArray, 3);
    this.paramsAttribute = new InstancedBufferAttribute(this.paramsArray, 3);

    this.geometry.setAttribute('aPosition', this.positionsAttribute); // Offset
    this.geometry.setAttribute('aParams', this.paramsAttribute);

    for (let i = 0; i < this.PARAMS.instancesCount * 3; i+=3) {
      this.positionsArray[i + 0] = (Math.random() - .5) * this.PARAMS.spreadRatio;
      this.positionsArray[i + 1] = (Math.random() - .5) * this.PARAMS.spreadRatio;
      this.positionsArray[i + 2] = (Math.random() - .5) * this.PARAMS.spreadRatio;

      const scale = (Math.random() * (this.PARAMS.scaleMax - this.PARAMS.scaleMin) + this.PARAMS.scaleMin) * (this.experience.renderer?.instance?.getPixelRatio() as number);
      const speed = 1 + Math.random() * this.PARAMS.speed;
      const index = i / 3;

      this.paramsArray[i + 0] = scale;
      this.paramsArray[i + 1] = speed;
      this.paramsArray[i + 2] = index;
    }
  }

  setMaterial(ISSPosition: Vector3, radiusFromEarth: number) {
    this.material = new ShaderBaseMaterial({
      uniforms: {
        uISSPos: { value: ISSPosition },
        uRadius: { value: radiusFromEarth },
        uLength: { value: .5 },
        uOffset: { value: .05 },
        uOpacityRatio: { value: .35 }
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false
    })
    if (this.PARAMS.blending) {
      this.material.blending = AdditiveBlending;
    }
  }

  setMesh() {
    if (this.geometry && this.material) {
      this.mesh = new Points(this.geometry, this.material);
    }
  }

  update(ISSPosition: Vector3) {
    if (this.material) {
      this.material.uniforms.uISSPos.value = ISSPosition;
    }
  }

  regenerate() {
    this.geometry?.dispose();
    this.material?.dispose();
    this.scene?.remove(this.mesh as Points);

    this.setGeometry();
    this.setMaterial(this.PARAMS.ISSPosition, this.PARAMS.radiusFromEarth);
    this.setMesh();

    if (this.mesh) this.scene?.add(this.mesh);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugTab = this.debug.ui?.pages[1].addFolder({ title: "ISS Trail" });
      
      const instancesCountInput = this.debugTab?.addInput(this.PARAMS, "instancesCount", { min: 10, max: 200, step: 1, label: 'count' });
      instancesCountInput?.on("change", () => { this.regenerate() });

      const spreadRatioInput = this.debugTab?.addInput(this.PARAMS, "spreadRatio", { min: 0, max: .2, label: 'spread' });
      spreadRatioInput?.on("change", () => { this.regenerate() });

      this.debugTab?.addInput(this.material?.uniforms.uOffset as IUniform, "value", { min: 0, max: .2, label: 'offset' });

      const scaleMinInput = this.debugTab?.addInput(this.PARAMS, "scaleMin", { min: 0, max: 50 });
      scaleMinInput?.on("change", () => { this.regenerate() });

      const scaleMaxInput = this.debugTab?.addInput(this.PARAMS, "scaleMax", { min: 0, max: 50 });
      scaleMaxInput?.on("change", () => { this.regenerate() });

      const speedInput = this.debugTab?.addInput(this.PARAMS, "speed", { min: 0, max: 2 });
      speedInput?.on("change", () => { this.regenerate() });

      const blendingInput = this.debugTab?.addInput(this.PARAMS, "blending" );
      blendingInput?.on("change", () => { this.regenerate() });

      this.debugTab?.addInput(this.material?.uniforms.uOpacityRatio as IUniform, "value", { min: 0, max: 1, label: 'opacity' });
    }
  }
}
