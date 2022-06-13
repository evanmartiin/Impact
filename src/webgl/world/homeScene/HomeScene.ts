import type Time from "@/webgl/controllers/Time";
import Billy from "./Billy/Billy";
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Debug from "@/webgl/controllers/Debug";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import {
  Group,
  Scene,
  Vector3,
  Texture,
  sRGBEncoding,
  Mesh,
  CubeTextureLoader,
  type IUniform,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { FolderApi, ButtonApi } from "tweakpane";
import Camera from "../Camera";
import SeedGame from "./SeedGame/SeedGame";
import fragment from "./Shaders/Map/fragment.glsl?raw";
import vertex from "./Shaders/Map/vertex.glsl?raw";
import PhysicCtrl from "./SeedGame/Controllers/Physic/PhysicCtrl";
import Plane from "./Plane/Plane";

import wiggleVertex from "./Shaders/wiggle/vertex.glsl?raw";
import wiggleFragment from "./Shaders/wiggle/fragment.glsl?raw";
import Clouds from "./Clouds/Clouds";

export default class HomeScene {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private debugTab: FolderApi | undefined = undefined;
  private debug: Debug = this.experience.debug as Debug;
  private time: Time = this.experience.time as Time;
  public instance: Group = new Group();
  private startButton: ButtonApi | null = null;
  private stopButton: ButtonApi | null = null;
  public game: SeedGame | null = null;
  public scene: Scene = new Scene();
  public cameraPos: Vector3 = new Vector3(10, 10, 10);
  private models: GLTF[] = [];
  private textures: Texture[] = [];
  public camera: Camera = new Camera(this.cameraPos, this.scene);
  private physicCtrl = new PhysicCtrl(this.scene);
  private billy: Billy | null = null;
  private plane: Plane | null = null;
  private clouds: Clouds | null = null;

  private wiggleShaderUniforms: { [uniform: string]: IUniform<any> } = {
    uWiggleRatio: { value: .2 },
  };

  constructor() {
    this.setFloor();
    this.setGame();
    this.setDebug();
    this.setSkybox();

    this.billy = new Billy(this.scene);
    this.plane = new Plane(this.scene);
    this.clouds = new Clouds(this.scene);
  }

  setGame() {
    if (this.camera.instance) this.game = new SeedGame(this.scene, this.camera);
  }

  applyWiggle(texture: Texture) {
    const wiggleMaterial = new ShaderBaseMaterial({
      uniforms: {
        ...this.wiggleShaderUniforms,
        uBakedTexture: { value: texture },
      },
      vertexShader: wiggleVertex,
      fragmentShader: wiggleFragment,
    });

    return wiggleMaterial;
  }

  setFloor() {
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
            if (child.name.includes("tree")) {
              child.material = this.applyWiggle(this.textures[index]);
            } else {
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
            if (index === 1) {
              this.physicCtrl.addFloor(child);
            } else {
              this.physicCtrl.addCollider(child);
            }
          }
        });
        this.scene?.add(model.scene);
      }
    });
  }

  setSkybox() {
    const loader = new CubeTextureLoader();
    loader.setPath("textures/skybox/home/");
    loader.load(
      ["px.jpg", "px.jpg", "py.jpg", "ny.jpg", "px.jpg", "px.jpg"],
      (textureCube) => {
        textureCube.encoding = sRGBEncoding;
        this.scene.background = textureCube;
      }
    );
  }

  update() {
    if (this.game) {
      this.game.update();
      this.billy?.update();
    }
    this.plane?.update();
    this.clouds?.update();
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

    const debugTab2 = this.debug.ui?.pages[2].addFolder({ title: "Wiggle" });
    debugTab2?.addInput(this.wiggleShaderUniforms.uWiggleRatio, "value", {
      min: 0,
      max: 3,
      label: "Ratio"
    });
  }
}
