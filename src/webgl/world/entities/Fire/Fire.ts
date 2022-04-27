import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, Mesh, CylinderBufferGeometry, ShaderMaterial, DoubleSide, TextureLoader, Color, AdditiveBlending } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'

export default class Fire {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private geometry: CylinderBufferGeometry | null = null;
  private material: ShaderMaterial | null = null;
  private mesh: Mesh | null = null;
  private isToggled: boolean = false;

  constructor() {
    this.setMesh();
    this.setDebug();
  }

  setMesh() {
    this.geometry = new CylinderBufferGeometry(.1, 2, 8, 100, 100, true);
    this.geometry.computeTangents();
    this.material = new ShaderMaterial({ 
      transparent: true,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: this.time?.elapsed },
        nbWaves: { value: 2. },
        smoothness: { value: 5. },
        fireColor: { value: new Color('#ff8a1e') },
        perlinnoise: { value: new TextureLoader().load("https://raw.githubusercontent.com/pizza3/asset/master/water-min.jpg") },
        noise: { value: new TextureLoader().load("https://raw.githubusercontent.com/pizza3/asset/master/noise9.jpg") }
      },
      vertexShader: vert,
      fragmentShader: frag,
      defines: {
        USE_TANGENT: ''
      },
      side: DoubleSide,
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 3, 0);
  }

  update() {
    if (this.material) {
      this.material.uniforms.uTime.value = this.time.elapsed;
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Fire" });
      const toggleFire = this.debugFolder?.addButton({
        title: "Toggle Fire",
      });
      toggleFire?.on("click", () => {
        if (this.isToggled) {
          this.scene.remove(this.mesh as Mesh);
          this.isToggled = false;
        } else {
          this.scene.add(this.mesh as Mesh);
          this.isToggled = true;
        }
      });
    }
  }
}
