import Experience from "@/webgl/Experience";
import { Scene, Mesh, Texture, sRGBEncoding, MeshBasicMaterial, Vector3 } from "three";
import type Time from "@/webgl/controllers/Time";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import Trail from "./Trail";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";

export default class ISS {
  private experience: Experience = new Experience();
  private scene: Scene | null = null;
  private time: Time = this.experience.time as Time;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debug: Debug = this.experience.debug as Debug;
  public debugTab: FolderApi | undefined = undefined;
  public model: GLTF | null = null;
  private trail: Trail | null = null;

  static radiusFromEarth: number = 1.6;

  constructor(scene: Scene) {
    this.scene = scene;

    this.setMesh();
    this.setTrail();
    this.setDebug();
  }

  setMesh() {
    this.model = this.loaders.items["earth:satellite-model"] as GLTF;
    const bakedTexture = this.loaders.items[
      "earth:satellite-texture"
    ] as Texture;
    bakedTexture.flipY = false;
    bakedTexture.encoding = sRGBEncoding;
    const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });

    this.model.scene.traverse((child) => {
      (child as Mesh).material = bakedMaterial;
    })
    this.model.scene.scale.set(.01, .01, .01);
    this.model.scene.position.set(ISS.radiusFromEarth, 0, 0);
    this.model.scene.lookAt(0, 0, 0);
    this.scene?.add(this.model.scene);
  }

  setTrail() {
    const ISSPosition = new Vector3().copy(this.model?.scene.position as Vector3);
    this.trail = new Trail(ISSPosition, ISS.radiusFromEarth, this.scene as Scene);
  }

  update() {
    if (this.model) {
      this.model.scene.position.x = Math.cos(this.time.elapsed/2000) * ISS.radiusFromEarth;
      // this.model.scene.position.y = Math.sin(this.time.elapsed/2000);
      this.model.scene.position.z = Math.sin(this.time.elapsed/2000) * ISS.radiusFromEarth;
      this.model.scene.lookAt(new Vector3());
      this.model.scene.rotateZ(90);
    }

    const ISSPosition = new Vector3().copy(this.model?.scene.position as Vector3);
    this.trail?.update(ISSPosition);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugTab = this.debug.ui?.pages[1].addFolder({ title: "ISS" });
      const PARAMS = {
        radius: ISS.radiusFromEarth
      };
      const radiusInput = this.debugTab?.addInput(PARAMS, "radius", {
        min: 1,
        max: 2
      });
      radiusInput?.on("change", (e) => {
        ISS.radiusFromEarth = e.value;
        if (this.trail?.mesh) {
          (this.trail.mesh.material as ShaderBaseMaterial).uniforms.uRadius.value = e.value;
        }
      })
    }
  }
}
