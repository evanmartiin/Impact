import Experience from "@/webgl/Experience";
import vert from './trailShaders/vert.glsl?raw'
import frag from './trailShaders/frag.glsl?raw'
import { Vector3, InstancedBufferGeometry, InstancedBufferAttribute, ShaderMaterial, DoubleSide, Scene, Float32BufferAttribute, AdditiveBlending, Points } from "three";
import type Time from "@/webgl/controllers/Time";

export default class Trail {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;

  static cooldown = 20;
  static lastInstance = 0;
  static lastIndexUpdated = 0;
  private geometry: InstancedBufferGeometry;
  private material: ShaderMaterial;

  private mesh: Points | null = null;

  private instancesCount: number = 40;

  private positionsArray: Float32Array | null = null;
  private positionsAttribute: InstancedBufferAttribute | null = null;
  
  private paramsArray: Float32Array | null = null;
  private paramsAttribute: InstancedBufferAttribute | null = null;

  constructor() {
    this.geometry = new InstancedBufferGeometry();
    this.geometry.instanceCount = this.instancesCount;
    this.geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3)); // Base geometry vertices positions

    this.positionsArray = new Float32Array(this.instancesCount * 3);
    this.paramsArray = new Float32Array(this.instancesCount * 3);

    this.positionsAttribute = new InstancedBufferAttribute(this.positionsArray, 3);
    this.paramsAttribute = new InstancedBufferAttribute(this.paramsArray, 3);

    this.geometry.setAttribute('aPosition', this.positionsAttribute); // Offset
    this.geometry.setAttribute('aParams', this.paramsAttribute);

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: this.time?.elapsed },
        uLength: { value: 1 },
        uISSPos: { value: new Vector3() }
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    })

    this.mesh = new Points(this.geometry, this.material);

    for (let i = 0; i < this.instancesCount * 3; i+=3) {
      this.positionsArray[i + 0] = i/20 * Math.random();
      this.positionsArray[i + 1] = 0;
      this.positionsArray[i + 2] = 0;
      
      const scale = (Math.random() * 25 + 25) * (this.experience.renderer?.instance?.getPixelRatio() as number);
      const speed = Math.random() + .5;
      const lifespan = Math.random();

      this.paramsArray[i + 0] = scale;
      this.paramsArray[i + 1] = speed;
      this.paramsArray[i + 2] = lifespan;
    }

    this.scene.add(this.mesh);
  }

  add(ISSPosition: Vector3) {
    const { x, y, z } = ISSPosition;

    const index = 3 * (Trail.lastIndexUpdated % this.instancesCount);
    const positions = this.mesh?.geometry.attributes.aPosition.array;
    
    if (positions) {
      (positions[index + 0] as number) = x + (Math.random() - .5) / 50;
      (positions[index + 1] as number) = y + (Math.random() - .5) / 50;
      (positions[index + 2] as number) = z + (Math.random() - .5) / 50;
    }

    if (this.mesh) {
      this.mesh.geometry.attributes.aPosition.needsUpdate = true;
    }

    Trail.lastInstance = Date.now();
    Trail.lastIndexUpdated++;
  }

  update(ISSPosition: Vector3) {
    this.material.uniforms.uTime.value = this.time.elapsed;
    this.material.uniforms.uISSPos.value = ISSPosition;
  }
}
