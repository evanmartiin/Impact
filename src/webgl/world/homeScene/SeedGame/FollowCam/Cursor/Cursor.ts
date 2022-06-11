import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import {
  PlaneBufferGeometry,
  Mesh,
  PlaneGeometry,
  Texture,
  Group,
} from "three";

import fragment from "./Shaders/fragment.glsl?raw";
import vertex from "./Shaders/vertex.glsl?raw";

export default class Cursor {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private geometry: PlaneBufferGeometry | null = null;
  private texture: Texture | null = null;
  private material: ShaderBaseMaterial | null = null;
  private instance: Mesh | null = null;
  private isDisplayed = false;
  private container: Group | null = null;

  constructor(group: Group) {
    this.container = group;
    this.init();
  }

  private init() {
    this.texture = this.loaders.items["cursor-texture"] as Texture;
    this.material = new ShaderBaseMaterial({
      transparent: true,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        uTexture: { value: this.texture },
      },
    });
    this.geometry = new PlaneGeometry(0.002, 0.002, 1, 1);
    this.instance = new Mesh(this.geometry, this.material);
    this.instance.position.set(0, 0, -0.1);
    this.container?.add(this.instance);
  }

  display() {
    if (this.instance) this.instance.visible = true;
    this.isDisplayed = true;
  }

  hide() {
    if (this.instance) this.instance.visible = false;
    this.isDisplayed = false;
  }

  update() {}
}
