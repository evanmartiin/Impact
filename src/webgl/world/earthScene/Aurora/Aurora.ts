import Experience from "@/webgl/Experience";
import { Scene, ShaderMaterial, Mesh, DoubleSide, CylinderBufferGeometry, AdditiveBlending } from "three";
import type Time from "@/webgl/controllers/Time";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'

export default class Aurora {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private time: Time = this.experience.time as Time;
  private geometry: CylinderBufferGeometry | null = null;
  private material: ShaderMaterial | null = null;
  private meshTop: Mesh | null = null;
  private meshBottom: Mesh | null = null;

  constructor(scene: Scene) {
    this.scene = scene;

    this.setMesh();
  }

  setMesh() {
    this.geometry = new CylinderBufferGeometry(.4, .4, .15, 200, 1, true);

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: this.time.elapsed },
        uOffset: { value: Math.random() }
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: DoubleSide,
      transparent: true,
      blending: AdditiveBlending
    });
    this.meshTop = new Mesh(this.geometry, this.material);
    this.meshTop.position.y = 1.03;
    this.scene?.add(this.meshTop);

    this.meshBottom = new Mesh(this.geometry, this.material);
    this.meshBottom.position.y = -.9;
    this.meshBottom.rotateX(Math.PI);
    this.scene?.add(this.meshBottom);
  }

  update() {
    if (this.material) {
      this.material.uniforms.uTime.value = this.time.elapsed;
    }
  }
}
