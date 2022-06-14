import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, BufferGeometry, Points, BufferAttribute, AdditiveBlending } from "three";
import type { FolderApi } from "tweakpane";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";

export default class Ashes {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private debug: Debug = this.experience.debug as Debug;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debugTab: FolderApi | undefined = undefined;
  private geometry: BufferGeometry | null = null;
  private material: ShaderBaseMaterial | null = null;
  private mesh: Points | null = null;

  constructor(scene: Scene) {
    this.scene = scene;

    this.setMesh();
    this.setDebug();
  }

  setMesh() {
    this.geometry = new BufferGeometry();
    const count = 1000;

    const positions = new Float32Array(count * 3);
    const params = new Float32Array(count * 3);

    for(let i = 0; i < count * 3; i+=3) {
      positions[i + 0] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      params[i + 0] = Math.random();
      params[i + 1] = Math.random();
      params[i + 2] = Math.random();
    }

    this.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.geometry.setAttribute('aParams', new BufferAttribute(params, 3));

    this.material = new ShaderBaseMaterial({
      uniforms: {
        uTexture: { value: this.experience.loaders?.items["ash-texture"] },
        uSize: { value: this.experience.renderer?.instance?.getPixelRatio() },
        uScale: { value: 30. },
        uRatio: { value: 4. },
        uThreshold: { value: .2 }
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true
    })
    this.mesh = new Points(this.geometry, this.material);
    this.scene?.add(this.mesh);
  }

  setDebug() {
    if (this.debug.active && this.material) {
      this.debugTab = this.debug.ui?.pages[1].addFolder({ title: "Ashes" });
      this.debugTab?.addInput(this.material.uniforms.uScale, "value", { min: 5, max: 30, label: "scale" });
      this.debugTab?.addInput(this.material.uniforms.uRatio, "value", { min: 0, max: 5, label: "ratio" });
      this.debugTab?.addInput(this.material.uniforms.uThreshold, "value", { min: 0, max: 1, label: "threshold" });
    }
  }
}
