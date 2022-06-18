import signal from "signal-js";
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
  Vector3,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import SeedGame from "../SeedGame";
import fragment from "./Shaders/fragment.glsl?raw";
import vertex from "./Shaders/vertex.glsl?raw";
import treeSettings from "./treeSettings";

type TTreeSize = "big" | "medium" | "small";

export default class Tree {
  private game: SeedGame = new SeedGame();
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private scene: Scene | null = null;

  static bigModel: GLTF | null = null;
  static mediumModel: GLTF | null = null;
  static smallModel: GLTF | null = null;

  public instance: Group | null = null;
  private texture: Texture | null = null;
  private material: ShaderBaseMaterial | null = null;

  public life = 2;
  public isTargeted = false;

  private position = new Vector3();

  constructor(scene: Scene, type: TTreeSize, position: Vector3) {
    this.scene = scene;
    this.position.copy(position);
    this.setMaterials();
    this.setModels(type);
    this.setMesh(position);
    this.animate(type);
    this.game.trees.push(this);
    signal.emit("updateLumberjackTarget");
    this.game.score++;
  }

  setMaterials() {
    this.texture = this.loaders.items[
      "home:poppingTreesAndSeed-texture"
    ] as Texture;
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
  cut() {
    anime({
      targets: this.instance?.scale,
      x: 0,
      y: 0,
      z: 0,
      easing: "easeOutElastic(.5, .5)",
      duration: 700,
      complete: () => {
        this.destroy();
      },
    });
  }

  setModels(type: TTreeSize) {
    if (Tree.bigModel === null) {
      Tree.bigModel = this.loaders.items["home:bigTree-model"] as GLTF;
    }
    if (Tree.mediumModel === null) {
      Tree.mediumModel = this.loaders.items["home:mediumTree-model"] as GLTF;
    }
    if (Tree.smallModel === null) {
      Tree.smallModel = this.loaders.items["home:smallTree-model"] as GLTF;
    }
    if (Tree[`${type}Model`]) {
      this.instance = Tree[`${type}Model`]!.scene.clone();
      this.instance.scale.setScalar(0);
    }
  }

  setMesh(position: Vector3) {
    this.instance?.traverse((child) => {
      if (child instanceof Mesh && this.texture) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            m = this.material;
          });
        } else {
          child.material = this.material;
        }
      }
    });
    if (this.instance) {
      this.instance.position.set(position.x, position.y, position.z);
      this.scene?.add(this.instance);
    }
  }

  animate(type: TTreeSize) {
    anime({
      targets: this.instance?.scale,
      x: treeSettings[type].scale,
      y: treeSettings[type].scale,
      z: treeSettings[type].scale,
      easing: "easeOutElastic(.5, .5)",
      duration: 700,
    });
  }

  destroy() {
    this.instance?.traverse((child) => {
      if (child instanceof Mesh && this.texture) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            m = this.material;
          });
        } else {
          child.material = this.material;
        }
        child.geometry.dispose();
      }
      const index = this.game.trees.indexOf(this);
      this.game.trees.slice(index, 1);
      this.scene?.remove(this.instance as Group);
    });
  }
}
