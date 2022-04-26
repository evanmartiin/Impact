import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, Mesh, BufferGeometry, PointsMaterial, Points, Texture, sRGBEncoding, MeshBasicMaterial, Vector3, Group } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import vert from './vert.glsl?raw'
import frag from './frag.glsl?raw'
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import Trail from "./Trail";

export default class ISS {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debugFolder: FolderApi | undefined = undefined;
  private geometry: BufferGeometry | null = null;
  private material: PointsMaterial | null = null;
  private model: GLTF | null = null;
  public trailsInstances: Trail[] = [];
  public trailsMeshes: Group = new Group();

  constructor() {
    this.setMesh();
    this.setTrails();
    this.setDebug();
  }

  setMesh() {
    this.model = this.loaders.items["satellite-model"] as GLTF;
    const bakedTexture = this.loaders.items["satellite-texture"] as Texture;
    bakedTexture.flipY = false;
    bakedTexture.encoding = sRGBEncoding;
    const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });

    this.model.scene.traverse((child) => {
      (child as Mesh).material = bakedMaterial;
    })
    this.model.scene.scale.set(.01, .01, .01);
    this.model.scene.position.set(1.4, 0, 0);
    this.model.scene.lookAt(0, 0, 0);
    this.scene.add(this.model.scene);
  }

  setTrails() {
    this.scene.add(this.trailsMeshes);
  }

  update() {
    if (this.model) {
      this.model.scene.position.x = Math.cos(this.time.elapsed/2000) * 1.4;
      this.model.scene.position.y = Math.sin(this.time.elapsed/2000) * 1.4;
      const target = new Vector3(
        Math.cos(this.time.elapsed/2000) * .1,
        Math.sin(this.time.elapsed/2000) * .1,
        0
      )
      this.model.scene.lookAt(target);
    }
    if (Date.now() - Trail.lastInstance > Trail.cooldown) {
      this.trailsInstances.push(new Trail(this.model?.scene.position as Vector3));
    }
    
    this.trailsInstances.forEach((trail: Trail) => {
      trail.update();
    })
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Sky" });
    }
  }
}
