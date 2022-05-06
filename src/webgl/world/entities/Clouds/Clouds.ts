import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, Group, SphereBufferGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";

export default class Clouds {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private clouds: Group = new Group();
  private offsets: number[] = [];
  private PARAMS = {
    "radius": 1.2
  }

  constructor(count: number) {
    this.scene.add(this.clouds);
    this.setClouds(count);
    this.setDebug();
  }

  setClouds(count: number) {
    for (let i = 0; i < count; i++) {
      const cloud = new Group();
      
      const geometry = new SphereBufferGeometry(.1);
      const material = new MeshStandardMaterial({ color: 0xdddddd });
      const cloudGeo1 = new Mesh(geometry, material);
      cloud?.add(cloudGeo1);
  
      const cloudGeo2 = cloudGeo1.clone();
      cloudGeo2.position.set(-.1, -.01, 0);
      cloudGeo2.scale.set(.7, .7, .7);
      cloud.add(cloudGeo2);
  
      const cloudGeo3 = cloudGeo1.clone();
      cloudGeo3.position.set(.07, -.01, 0);
      cloudGeo3.scale.set(.8, .8, .8);
      cloud.add(cloudGeo3);
  
      if (cloud) {
        cloud.name = "Cloud";
        this.clouds.add(cloud);
        this.offsets.push((Math.random() - .5) * 10);
      }
    }
  }

  update() {
    if (this.clouds) {
      let index = 0;
      this.clouds.traverse((cloud: Object3D) => {
        if (cloud.name === "Cloud") {
          cloud.position.setFromSphericalCoords(this.PARAMS.radius,
            Math.PI / 2 + Math.cos(this.time.elapsed * .00002 * this.offsets[index] + this.offsets[index]) * Math.PI * .3,
            (this.time.elapsed * .00002 * this.offsets[index] + this.offsets[index]) * Math.PI
            );
          cloud.lookAt(0, 0, 0);
          index++;
        }
      })
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Clouds" });
      this.debugFolder?.addInput(this.PARAMS, "radius", { min: 1, max: 2 });
    }
  }
}
