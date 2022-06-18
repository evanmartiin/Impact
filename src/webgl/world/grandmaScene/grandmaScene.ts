import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import {
  Color,
  DirectionalLight,
  Mesh,
  MeshMatcapMaterial,
  Scene,
  Texture,
  Vector3,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import type Debug from "@/webgl/controllers/Debug";
import type { TabPageApi } from "tweakpane";
import Camera from "../Camera";

export default class GrandmaDistrict {
  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  private debugPage: TabPageApi | undefined = undefined;

  public scene: Scene = new Scene();
  public cameraPos: Vector3 = new Vector3(50, 50, 50);
  public camera: Camera = new Camera(this.cameraPos, this.scene);

  constructor() {
    this.setModel();
    this.setLight();
  }

  setModel() {
    const districtModel = this.loaders.items["grandma:map-model"] as GLTF;
    const districtMatcap = this.loaders.items[
      "common:comingSoonMapsMatcap-texture"
    ] as Texture;
    const districtMaterial = new MeshMatcapMaterial({
      matcap: districtMatcap,
      color: 0x1b5f2f,
    });
    districtModel.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = districtMaterial;
      }
    });
    this.scene.add(districtModel.scene);
  }

  setLight() {
    const sunLight = new DirectionalLight("#ffffff", 4);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(200, 0, 200);
    this.scene.add(sunLight);
  }
}
