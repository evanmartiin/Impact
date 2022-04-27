import Experience from "@/webgl/Experience";
import { Scene, Mesh, Texture, sRGBEncoding, MeshBasicMaterial, Vector3, AxesHelper, Euler } from "three";
import type Time from "@/webgl/controllers/Time";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import Trail from "./Trail";

export default class ISS {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  public model: GLTF | null = null;
  private leftTrail: Trail | null = null;
  private rightTrail: Trail | null = null;
  private axisHelper: Mesh | null = null;

  constructor() {
    this.setMesh();
    // this.setAxis();

    this.leftTrail = new Trail();
    this.rightTrail = new Trail();
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

  setAxis() {
    const axis = new AxesHelper(.4);
    this.axisHelper = new Mesh();
    this.axisHelper.add(axis);
    this.scene.add(this.axisHelper);
  }

  update() {
    if (this.model) {
      this.model.scene.position.x = Math.cos(this.time.elapsed/2000) * 1.4;
      // this.model.scene.position.y = Math.sin(this.time.elapsed/2000);
      this.model.scene.position.y = Math.sin(this.time.elapsed/2000) * 1.4;
      this.model.scene.lookAt(new Vector3());
    }
    this.axisHelper?.position.copy(this.model?.scene.position as Vector3);
    this.axisHelper?.rotation.copy(this.model?.scene.rotation as Euler);

    const leftTrailBase = new Vector3().copy(this.model?.scene.position as Vector3);
    leftTrailBase.z -= .25;
    const rightTrailBase = new Vector3().copy(this.model?.scene.position as Vector3);
    rightTrailBase.z += .25;

    if (Date.now() - Trail.lastInstance > Trail.cooldown) {
      this.leftTrail?.add(leftTrailBase);
      this.rightTrail?.add(rightTrailBase);
    }
    
    this.leftTrail?.update(leftTrailBase);
    this.rightTrail?.update(rightTrailBase);
  }
}
