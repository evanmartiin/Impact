import Experience from "@/webgl/Experience";
import { Scene, BufferGeometry, Points, BufferAttribute, Vector3 } from "three";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'
import type Camera from "../../Camera";
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";

export default class Ashes {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private camera: Camera | null = null;
  private geometry: BufferGeometry | null = null;
  private material: ShaderBaseMaterial | null = null;
  private mesh: Points | null = null;
  private startTime: number = 0;

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;

    this.setMesh();
  }

  setMesh() {
    this.geometry = new BufferGeometry();
    const count = 100;

    const positions = new Float32Array(count * 3);
    const params = new Float32Array(count * 2);
    
    const { x, y, z } = this.camera?.instance?.position as Vector3;

    for(let i = 0; i < count * 3; i+=3) {
      positions[i + 0] = x * .9 + (Math.random() - 0.5) * 2;
      positions[i + 1] = y * .9 + (Math.random() - 0.5) * 2;
      positions[i + 2] = z * .9 + (Math.random() - 0.5) * 2;

      params[i + 0] = Math.random();
      params[i + 1] = Math.random();
    }

    this.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.geometry.setAttribute('aParams', new BufferAttribute(params, 2));

    this.startTime = Date.now();

    this.material = new ShaderBaseMaterial({
      uniforms: {
        uAge: { value: 0 },
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
    this.scene?.add(this.mesh);
  }

  update() {
    if (this.material) {
      this.material.uniforms.uAge.value = Date.now() - this.startTime;
    }
  }
}
