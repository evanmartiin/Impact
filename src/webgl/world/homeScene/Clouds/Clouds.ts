import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import { Group, Mesh, MeshMatcapMaterial, Vector3, type Scene, type Texture } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { CloudParams } from "./cloudsSettings";
import cloudsSettings from "./cloudsSettings";

export default class Clouds {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private time: Time = this.experience.time as Time;
  private scene: Scene | null = null;

  private model: GLTF | null = null;
  private differentClouds: Mesh[] = [];
  private sceneClouds: Group = new Group();

  constructor(scene: Scene) {
    this.scene = scene;
    this.setMeshes();
  }

  setMeshes() {
    this.model = this.loaders.items["cloud-model"] as GLTF;
    this.model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        const matcap = this.loaders.items["plane-texture"] as Texture;
        const material = new MeshMatcapMaterial({ matcap: matcap, color: 0xcff0ff });
        child.material = material;
        this.differentClouds.push(child);
      }
    })

    cloudsSettings.forEach((cloudParams: CloudParams) => {
      const cloud = this.differentClouds[cloudParams.type].clone();
      cloud.scale.set(cloudParams.scale, cloudParams.scale, cloudParams.scale);
      cloud.position.copy(cloudParams.pos);
      cloud.rotateOnWorldAxis(new Vector3(0, 1, 0), cloudParams.rotateY);
      cloud.rotateOnWorldAxis(new Vector3(0, 0, 1), cloudParams.rotateZ);
      cloudParams.rotateY = cloud.rotation.y;
      cloudParams.rotateZ = cloud.rotation.z;
      cloud.name = cloudParams.name;
      this.sceneClouds.add(cloud);
    })
    
    this.scene?.add(this.sceneClouds);
  }

  update() {
    this.sceneClouds.traverse((child) => {
      if (child instanceof Mesh) {
        const params = cloudsSettings.find((el) => el.name === child.name);
        if (params) {
          child.position.x = params.pos.x + Math.sin(this.time.elapsed * .001 * params.speed) * .005;
          child.position.y = params.pos.y + Math.sin(this.time.elapsed * .001 * params.speed) * .005;
          child.position.z = params.pos.z + Math.cos(this.time.elapsed * .001 * params.speed) * .005;

          const rotateY = params.rotateY + Math.cos(this.time.elapsed * .001 * params.speed) * .05;
          child.rotation.y = rotateY;
          const rotateZ = params.rotateZ + Math.sin(this.time.elapsed * .001 * params.speed) * .05;
          child.rotation.z = rotateZ;
        }
      }
    })
  }
}
