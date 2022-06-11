import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import {
  Mesh,
  sRGBEncoding,
  Group,
  type Scene,
  type Texture,
  type Vector3,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import fragment from "./Shaders/fragment.glsl?raw";
import vertex from "./Shaders/vertex.glsl?raw";
import treeSettings from "./treeSettings";

type TTreeSize = "big" | "medium" | "small";

export default class Tree {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private scene: Scene | null = null;

  static bigModel: GLTF | null = null;
  static mediumModel: GLTF | null = null;
  static smallModel: GLTF | null = null;

  private model: Group | null = null;
  private texture: Texture | null = null;
  private material: ShaderBaseMaterial | null = null;

  static trees: Tree[];

  constructor(scene: Scene, type: TTreeSize, position: Vector3) {
    this.scene = scene;
    this.setMaterials();
    this.setModels(type);
    this.setMesh(position);
    this.animate(type);
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
    if (Tree[`${type}Model`]) {
      this.model = Tree[`${type}Model`]!.scene.clone();
      this.model.scale.setScalar(0);
    }
  }

  setMesh(position: Vector3) {
    this.model?.traverse((child) => {
      if (child instanceof Mesh && this.texture) {
        if (Array.isArray(child.material)) {
          child.material.map((m) => {
            m = this.material;
          });
        } else {
          child.material = this.material;
        }
      }
    });
    if (this.model) {
      this.model.position.set(position.x, position.y, position.z);
      this.scene?.add(this.model);
    }
  }

  animate(type: TTreeSize) {
    anime({
      targets: this.model?.scale,
      x: treeSettings[type].scale,
      y: treeSettings[type].scale,
      z: treeSettings[type].scale,
      easing: "easeOutElastic(.5, .5)",
      duration: 700,
    });
  }
}
