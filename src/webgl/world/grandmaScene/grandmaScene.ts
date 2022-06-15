import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import { Mesh, Scene, sRGBEncoding, Texture, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import type Debug from "@/webgl/controllers/Debug";
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import type { TabPageApi } from "tweakpane";
import Camera from "../Camera";
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";

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
  }

  setModel() {
    const models = [
      this.loaders.items["housev1model"] as GLTF,
      this.loaders.items["grassv1model"] as GLTF,
    ];
    const textures = [
      this.loaders.items["housev1texture"] as Texture,
      this.loaders.items["grassv1texture"] as Texture,
    ];
    models.forEach((model, index) => {
      if (textures && textures[index]) {
        textures[index].flipY = false;
        textures[index].encoding = sRGBEncoding;
        model.scene.traverse((child) => {
          if (child instanceof Mesh && textures) {
            const bakedMaterial = new ShaderBaseMaterial({
              transparent: true,
              fragmentShader: fragment,
              vertexShader: vertex,
              uniforms: {
                uBakedTexture: { value: textures[index] },
              },
            });
            (child as Mesh).material = bakedMaterial;
          }
        });
        this.scene?.add(model.scene);
      }
    });
  }
}
