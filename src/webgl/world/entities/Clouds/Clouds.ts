import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, BufferGeometry, PointsMaterial, Points, BufferAttribute, AdditiveBlending, ShaderMaterial, Vector2, Group, SphereBufferGeometry, MeshBasicMaterial, Mesh, MeshStandardMaterial } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import vert from './shaders/vert.glsl?raw'
import frag from './shaders/frag.glsl?raw'

export default class Clouds {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private geometry: BufferGeometry | null = null;
  private material: ShaderMaterial | null = null;
  private group: Group | null = null;
  private radius: number = 1.2;
  private offset: number = (Math.random() - .5) * 3;

  constructor() {
    this.setMesh();
    this.setDebug();
  }

  setMesh() {
    this.group = new Group();
    
    const geometry = new SphereBufferGeometry(.1);
    const material = new MeshStandardMaterial({ color: 0xdddddd });
    const cloud = new Mesh(geometry, material);
    this.group?.add(cloud);

    const cloud2 = cloud.clone();
    cloud2.position.set(-.1, -.01, 0);
    cloud2.scale.set(.7, .7, .7);
    this.group.add(cloud2);

    const cloud3 = cloud.clone();
    cloud3.position.set(.07, -.01, 0);
    cloud3.scale.set(.8, .8, .8);
    this.group.add(cloud3);

    if (this.group) {
      this.scene.add(this.group);
    }
  }

  update() {
    if (this.group) {
      this.group.position.setFromSphericalCoords(this.radius,
        Math.PI / 2 + Math.cos(this.time.elapsed * .00002 * this.offset + this.offset) * Math.PI * .3,
        (this.time.elapsed * .00002 * this.offset + this.offset) * Math.PI
        );
      this.group.lookAt(0, 0, 0);
    }
  }

  setDebug() {
    if (this.debug.active && this.material) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Clouds" });
    }
  }
}
