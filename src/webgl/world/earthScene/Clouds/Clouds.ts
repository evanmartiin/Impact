import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, Group, SphereBufferGeometry, Mesh, MeshStandardMaterial, Object3D, Texture, MeshMatcapMaterial, Vector3 } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export default class Clouds {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  private debugTab: FolderApi | undefined = undefined;
  private clouds: Group = new Group();
  private differentClouds: Mesh[] = [];
  private offsets: number[] = [];
  private PARAMS = {
    "radius": 1.2
  }

  constructor(count: number, scene: Scene) {
    this.scene = scene;

    this.scene.add(this.clouds);
    this.setClouds(count);
    this.setDebug();
  }

  setClouds(count: number) {
    const model = this.loaders.items["common:cloud-model"] as GLTF;
    model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        const matcap = this.loaders.items["plane-texture"] as Texture;
        const material = new MeshMatcapMaterial({ matcap: matcap, color: 0xcff0ff });
        child.material = material;
        this.differentClouds.push(child);
      }
    })

    for (let i = 0; i < count; i++) {
      const cloud = this.differentClouds[Math.floor(this.differentClouds.length * Math.random())].clone();
      const scale = Math.random() * .01 + .005;
      cloud.scale.set(scale, scale, scale);
      cloud.name = "Cloud";
      this.clouds.add(cloud);
      this.offsets.push((Math.random() - .5) * 10);
    }
  }

  update() {
    if (this.clouds) {
      let index = 0;
      this.clouds.traverse((cloud: Object3D) => {
        if (cloud.name === "Cloud") {
          cloud.position.setFromSphericalCoords(this.PARAMS.radius,
            Math.PI / 2 + Math.cos(this.time.elapsed * .00001 * this.offsets[index] + this.offsets[index]) * Math.PI * .3,
            (this.time.elapsed * .00001 * this.offsets[index] + this.offsets[index]) * Math.PI
            );
          cloud.lookAt(0, 0, 0);
          cloud.rotateOnAxis(new Vector3(1, 0, 0), 5.5);
          index++;
        }
      })
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugTab = this.debug.ui?.pages[1].addFolder({ title: "Clouds" });
      this.debugTab?.addInput(this.PARAMS, "radius", { min: 1, max: 2 });
    }
  }
}
