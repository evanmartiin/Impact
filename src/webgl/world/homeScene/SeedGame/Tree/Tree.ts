import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import {
  Mesh,
  sRGBEncoding,
  type Scene,
  type Texture,
  type Vector3,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import fragment from "./Shaders/fragment.glsl?raw";
import vertex from "./Shaders/vertex.glsl?raw";

type TTreeSize = "big" | "medium" | "small";

export default class Tree {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private scene: Scene | null = null;

  static bigModel: GLTF | null = null;
  static mediumModel: GLTF | null = null;
  static smallModel: GLTF | null = null;

  private model: GLTF | null = null;
  private texture: Texture | null = null;
  private material: ShaderBaseMaterial | null = null;

  static trees: Tree[];

  constructor(scene: Scene, type: TTreeSize, position: Vector3) {
    this.scene = scene;
    this.setMaterials();
    this.setModels(type);
    this.setMesh(position);
    // Tree.trees.push(this);
  }

  setMaterials() {
    this.texture = this.loaders.items["poppingtrees-seed-texture"] as Texture;
    this.texture.flipY = false;
    this.texture.encoding = sRGBEncoding;

    this.material = new ShaderBaseMaterial({
      transparent: true,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        uTexture: { value: this.texture },
      },
    });
  }

  setModels(type: TTreeSize) {
    if (Tree.bigModel === null) {
      Tree.bigModel = this.loaders.items["big-tree-model"] as GLTF;
    }
    if (Tree.mediumModel === null) {
      Tree.mediumModel = this.loaders.items["medium-tree-model"] as GLTF;
    }
    if (Tree.smallModel === null) {
      Tree.smallModel = this.loaders.items["small-tree-model"] as GLTF;
    }
    this.model = Tree[`${type}Model`];
  }

  setMesh(position: Vector3) {
    this.model?.scene.traverse((child) => {
      if (child instanceof Mesh && this.texture) {
        if (Array.isArray(child.material)) {
          child.material.map((m) => {
            m = this.material;
          });
        } else {
          child.material = this.material;
        }
        // if (index === 1) {
        //   this.physicCtrl.addFloor(child);
        // } else {
        //   this.physicCtrl.addCollider(child);
        // }
      }
    });
    if (this.model) {
      this.model.scene.position.set(position.x, position.y, position.z);
      this.scene?.add(this.model.scene);
    }
  }
}
