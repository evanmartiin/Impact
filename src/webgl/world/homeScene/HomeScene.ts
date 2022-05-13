import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import {
  DirectionalLight,
  Group,
  Scene,
  Vector3,
  Texture,
  sRGBEncoding,
  Mesh,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi, ButtonApi } from "tweakpane";
import Camera from "../Camera";
import SeedGame from "./SeedGame/SeedGame";
import fragment from "./Shaders/Map/fragment.glsl?raw";
import vertex from "./Shaders/Map/vertex.glsl?raw";

export default class HomeScene {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  public instance: Group = new Group();
  private startButton: ButtonApi | null = null;
  private stopButton: ButtonApi | null = null;
  public game: SeedGame | null = null;
  public scene: Scene = new Scene();
  public cameraPos: Vector3 = new Vector3(50, 50, 50);
  private models: GLTF[] = [];
  private textures: Texture[] = [];
  public camera: Camera = new Camera(this.cameraPos, this.scene);

  constructor() {
    if (this.camera.instance) this.game = new SeedGame(this.scene, this.camera);

    // const mainModel = this.loaders.items["housev1model"] as GLTF;
    this.models = [
      this.loaders.items["housev1model"] as GLTF,
      this.loaders.items["grassv1model"] as GLTF,
    ];
    this.textures = [
      this.loaders.items["housev1texture"] as Texture,
      this.loaders.items["grassv1texture"] as Texture,
    ];
    this.models.forEach((model, index) => {
      if (this.textures && this.textures[index]) {
        this.textures[index].flipY = false;
        this.textures[index].encoding = sRGBEncoding;
        model.scene.traverse((child) => {
          if (child instanceof Mesh && this.textures) {
            const bakedMaterial = new ShaderBaseMaterial({
              transparent: true,
              fragmentShader: fragment,
              vertexShader: vertex,
              uniforms: {
                uTexture: { value: this.textures[index] },
              },
            });
            (child as Mesh).material = bakedMaterial;
          }
        });
        this.scene?.add(model.scene);
      }
    });
    // this.scene.add(mainModel.scene);

    const sunLight = new DirectionalLight("#ffffff", 4);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(200, 0, 200);
    this.scene.add(sunLight);

    this.setDebug();
    // this.character.appear();
  }

  update() {
    if (this.game) this.game.update();
  }

  enterGameView() {
    if (!this.game?.isGameView) {
      if (this.game) this.game.enterGameView();
    }
  }

  leaveGameView() {
    if (this.game?.isGameView) {
      if (this.game) this.game.leaveGameView();
    }
  }

  setDebug() {
    this.debugTab = this.debug.ui?.pages[2].addFolder({ title: "Home" });
    if (this.scene?.position) {
      this.debugTab?.addInput(this.camera?.instance?.position as Vector3, "x", {
        min: -10,
        max: 10,
        step: 0.1,
      });
      this.debugTab?.addInput(this.camera?.instance?.position as Vector3, "y", {
        min: -10,
        max: 10,
        step: 0.01,
      });
      this.debugTab?.addInput(this.camera?.instance?.position as Vector3, "z", {
        min: -10,
        max: 10,
        step: 0.01,
      });
    }

    this.startButton = this.debugTab?.addButton({
      title: "Enter Game",
    }) as ButtonApi;
    this.startButton?.on("click", () => {
      this.enterGameView();
    });

    this.stopButton = this.debugTab?.addButton({
      title: "Leave Game",
    }) as ButtonApi;
    this.stopButton?.on("click", () => {
      this.leaveGameView();
    });
  }
}
