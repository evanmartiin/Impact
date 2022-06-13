import type { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type { Scene, Texture } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export default class Clouds {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private scene: Scene | null = null;

  static bigModel: GLTF | null = null;
  static mediumModel: GLTF | null = null;
  static smallModel: GLTF | null = null;

  private model: GLTF | null = null;
  private texture: Texture | null = null;
  private material: ShaderBaseMaterial | null = null;
  private clouds: GLTF | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setMeshes();
  }

  setMeshes() {
    this.clouds = this.loaders.items["cloud-model"] as GLTF;
  }
}
