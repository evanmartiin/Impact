import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, BufferGeometry, PointsMaterial, Points, BufferAttribute, AdditiveBlending, ShaderMaterial, Vector2 } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'
import ShaderBaseMaterial from "@/utils/ShaderBaseMaterial";

export default class Stars {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private geometry: BufferGeometry | null = null;
  private material: ShaderMaterial | null = null;
  private mesh: Points | null = null;

  constructor() {
    this.setMesh();
    this.setDebug();
  }

  setMesh() {
    this.geometry = new BufferGeometry();
    const count = 500;

    const positions = new Float32Array(count * 3);
    const blinking = new Float32Array(count * 2);

    for(let i = 0; i < count * 3; i+=3) {
      positions[i + 0] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      blinking[i + 0] = Math.random();
      blinking[i + 1] = Math.random();
    }

    this.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.geometry.setAttribute('aBlinking', new BufferAttribute(blinking, 2));

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: this.time.elapsed },
        uSize: { value: this.experience.renderer?.instance?.getPixelRatio() },
        uScale: { value: 20. },
        uRadius: { value: 1. },
        uRatio: { value: 4. },
        uThreshold: { value: .2 }
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true
    })
    this.mesh = new Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  update() {
    if (this.material) {
      this.material.uniforms.uTime.value = this.time.elapsed;
    }
  }

  setDebug() {
    if (this.debug.active && this.material) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Stars" });
      this.debugFolder?.addInput(this.material.uniforms.uScale, "value", { min: 5, max: 30, label: "scale" });
      this.debugFolder?.addInput(this.material.uniforms.uRadius, "value", { min: 0, max: 1, label: "radius" });
      this.debugFolder?.addInput(this.material.uniforms.uRatio, "value", { min: 0, max: 5, label: "ratio" });
      this.debugFolder?.addInput(this.material.uniforms.uThreshold, "value", { min: 0, max: 1, label: "threshold" });
    }
  }
}
