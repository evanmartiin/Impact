import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, Mesh, CylinderBufferGeometry, DoubleSide, TextureLoader, Color, AdditiveBlending } from "three";
import type { FolderApi } from "tweakpane";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";

export default class Fire {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private debug: Debug = this.experience.debug as Debug;
  private debugTab: FolderApi | undefined = undefined;
  private geometry: CylinderBufferGeometry | null = null;
  private material: ShaderBaseMaterial | null = null;
  private mesh: Mesh | null = null;
  private isToggled: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;

    this.setMesh();
    this.setDebug();
  }

  setMesh() {
    this.geometry = new CylinderBufferGeometry(.1, 2, 8, 100, 100, true);
    this.geometry.computeTangents();
    this.material = new ShaderBaseMaterial({ 
      transparent: true,
      blending: AdditiveBlending,
      uniforms: {
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

  setDebug() {
    if (this.debug.active) {
      this.debugTab = this.debug.ui?.pages[1].addFolder({ title: "Fire" });
      const toggleFire = this.debugTab?.addButton({
        title: "Toggle Fire",
      });
      toggleFire?.on("click", () => {
        if (this.isToggled) {
          this.geometry?.dispose();
          this.material?.dispose();
          this.scene?.remove(this.mesh as Mesh);
          this.isToggled = false;
        } else {
          this.setMesh();
          this.scene?.add(this.mesh as Mesh);
          this.isToggled = true;
        }
      });
    }
  }
}
