import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Sizes from "@/webgl/controllers/Sizes";
import Experience from "@/webgl/Experience";
import type Camera from "@/webgl/world/Camera";
import anime from "animejs";
import { Group, MeshBasicMaterial, Object3D, Scene, Mesh, Texture, sRGBEncoding } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import Fire from "../Fire/Fire";
import ISS from "../ISS/ISS";

export default class Earth {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private sizes: Sizes = this.experience.sizes as Sizes;
  private time: Time = this.experience.time as Time;
  private camera: Camera = this.experience.camera as Camera;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private earth: Group | null = null;
  public earthGroup: Group = new Group();
  private model: GLTF | null = null;
  private districtsMeshes: Object3D[] = [];
  private isDisplayed = false;
  public fire: Fire | null = null;
  public ISS: ISS | null = null;

  constructor() {
    this.setMesh();
    this.setDebug();
    
    this.fire = new Fire();
    this.ISS = new ISS();
  }

  setMesh() {
    this.model = this.loaders.items["earth-baked-model"] as GLTF;
    const bakedTexture = this.loaders.items["earth-baked-texture"] as Texture;
    
    bakedTexture.flipY = false;
    bakedTexture.encoding = sRGBEncoding;
    const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });

    this.model.scene.traverse((child) => {
      (child as Mesh).material = bakedMaterial;
    })
    this.scene.add(this.model.scene);
    
    this.earth = new Group();
    // const meshes = [];
    // meshes.push(...this.model.scene.children);
    // meshes.push(...this.model.scenes[0].children);
    // bakedTexture.flipY = false;
    
    
    
    // meshes.map((child) => {
    //   if (typeof child === "object") {
    //     this.earth?.add(child);
    //     console.log(child);
        
    //     if (child instanceof Mesh) {
    //       if ((child.name === "zone_maison001" || child.name === "zone_mamie" || child.name === "zone_maison")) {
    //         child.material = new MeshBasicMaterial({ color: 0xffffff, transparent: true })
    //         this.districtsMeshes.push(child);
    //       } else {
    //         child.material = bakedMaterial;
    //       }
    //     }
    //   }
    // });
    this.districtsMeshes = [...new Set(this.districtsMeshes)];

    this.earth.rotateY(Math.PI);
    this.earth.scale.set(1, 1, 1);
    this.earthGroup.add(this.earth);
    this.scene.add(this.earthGroup);
    this.earthGroup.position.set(10, 0, 0);
    this.earthGroup.scale.set(1.5, 1.5, 1.5);
    if (this.camera.instance) {
      const tl = anime.timeline({});
      tl.add(
        {
          targets: this.earthGroup?.position,
          x: [0, 0],
          y: [-10, 0],
          z: [0, 0],
          easing: "easeInOutQuart",
          duration: 1000,
        },
        0
      );
    }
    this.isDisplayed = true;
  }

  appear() {
    if (!this.isDisplayed) {
      if (this.earthGroup && this.camera.instance && this.camera.controls) {
        const tl = anime.timeline({});
        tl.add(
          {
            targets: this.earthGroup?.position,
            x: [0, 0],
            y: [-10, 0],
            z: [0, 0],
            easing: "easeInOutQuart",
            duration: 700,
          },
          300
        );
        tl.add(
          {
            targets: this.earthGroup?.scale,
            x: [this.earthGroup?.scale.x, 1.5],
            y: [this.earthGroup?.scale.y, 1.5],
            z: [this.earthGroup?.scale.z, 1.5],
            easing: "easeInOutQuart",
            duration: 700,
          },
          300
        );
      }
      this.isDisplayed = true;
    }
  }

  disappear() {
    if (this.isDisplayed) {
      const tl = anime.timeline({});
      tl.add(
        {
          targets: this.earthGroup?.position,
          x: [this.earthGroup?.position.x, 0],
          y: [this.earthGroup?.position.y, -10],
          z: [this.earthGroup?.position.z, 0],
          easing: "easeInOutQuart",
          duration: 1000,
        },
        0
      );
      tl.add(
        {
          targets: this.earthGroup?.scale,
          x: [this.earthGroup?.scale.x, 0.1],
          y: [this.earthGroup?.scale.y, 0.1],
          z: [this.earthGroup?.scale.z, 0.1],
          easing: "easeInOutQuart",
          duration: 700,
        },
        0
      );
      this.isDisplayed = false;
    }
  }

  setDebug() {
    if (this.debug.active) {

    }
  }

  update() {
    this.districtsMeshes.forEach((district) => {
      if (district instanceof Mesh) {
        district.material.opacity = (Math.cos(this.time.elapsed / 300) + 1) / 2;
      }
    });
    this.ISS?.update();
  }
}
