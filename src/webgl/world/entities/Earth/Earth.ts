import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type Camera from "@/webgl/world/Camera";
import anime from "animejs";
import { Group, MeshBasicMaterial, Scene, Mesh, Texture, sRGBEncoding, DoubleSide, type IUniform, Vector2 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import Fire from "../Fire/Fire";
import ISS from "../ISS/ISS";
import commonVertex from "./shaders/commonVertex.glsl?raw";
import beginVertex from "./shaders/beginVertex.glsl?raw";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type Mouse from "@/webgl/controllers/Mouse";

export default class Earth {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private camera: Camera = this.experience.camera as Camera;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  public earthGroup: Group = new Group();
  private models: GLTF[] | null = null;
  private textures: Texture[] | null = null;
  private zones: Group = new Group();
  private zoneMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true });
  private movementMaterial: MeshBasicMaterial = new MeshBasicMaterial({ transparent: true });
  private movementShaderUniforms: { [uniform: string]: IUniform<any> } = {
    'uDirection': { value: new Vector2() },
    'uBounceRatio': { value: 2.5 }
  };
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
    this.models = [
      this.loaders.items["oceans-model"] as GLTF,
      this.loaders.items["continents-model"] as GLTF,
      this.loaders.items["house-mini-model"] as GLTF,
      this.loaders.items["city-mini-model"] as GLTF,
      this.loaders.items["granny-mini-model"] as GLTF,
      this.loaders.items["zones-model"] as GLTF
    ]
    this.textures = [
      this.loaders.items["oceans-texture"] as Texture,
      this.loaders.items["continents-texture"] as Texture,
      this.loaders.items["house-mini-texture"] as Texture,
      this.loaders.items["city-mini-texture"] as Texture,
      this.loaders.items["granny-mini-texture"] as Texture
    ]

    this.models.forEach((model, index) => {
      if (this.textures && this.textures[index]) {
        const bakedMaterial = new MeshBasicMaterial({ map: this.textures[index] });
        this.textures[index].flipY = false;
        this.textures[index].encoding = sRGBEncoding;
        model.scene.traverse((child) => {
          if(child instanceof Mesh) {
            if (this.textures && (child.name === "maison" || child.name === "ville" || child.name === "mamie")) {
              const customMaterial = this.movementMaterial.clone();
              customMaterial.map = this.textures[index];
              customMaterial.onBeforeCompile = (shader) => {
                shader.uniforms = {...this.movementShaderUniforms, ...shader.uniforms};
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <common>",
                  commonVertex
                );
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <begin_vertex>",
                  beginVertex
                );
              };
              if (child.name === "ville") {
                child.rotateY(Math.PI * .13);
              } else if (child.name === "maison") {
                child.rotateY(Math.PI * .65);
              } else if (child.name === "mamie") {
                customMaterial.side = DoubleSide;
                child.rotateY(Math.PI * -.1);
              }
              child.material = customMaterial;
            } else {
              child.material = bakedMaterial;
            }
          }
        });
        this.earthGroup?.add(model.scene);
      } else {
        model.scene.traverse((child) => {
          if (child instanceof Mesh) {
            let zone = child.clone();
            zone.material = this.zoneMaterial;
            this.zones.add(zone);
          }
        })
        this.earthGroup.add(this.zones);
      }
    });

    this.mouse.on("mouse_grab", () => {
      this.movementShaderUniforms.uDirection.value = this.mouse.mouseInertia.clone();
    })

    this.scene.add(this.earthGroup);
    this.earthGroup.position.set(10, 0, 0);

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
            x: [this.earthGroup?.scale.x, 1],
            y: [this.earthGroup?.scale.y, 1],
            z: [this.earthGroup?.scale.z, 1],
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

  update() {
    this.zoneMaterial.opacity = (Math.cos(this.time.elapsed / 300) + 1) / 2;
    this.ISS?.update();
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });
      this.debugFolder?.addInput(this.movementShaderUniforms.uBounceRatio, "value", {
        min: 0, max: 5, label: "bounce"
      });
    }
  }
}
