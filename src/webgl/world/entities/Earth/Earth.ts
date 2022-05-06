import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type Camera from "@/webgl/world/Camera";
import anime from "animejs";
import { Group, MeshBasicMaterial, Scene, Mesh, Texture, sRGBEncoding, DoubleSide, type IUniform, Vector2, ShaderMaterial, Color, type Shader, PlaneBufferGeometry, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import Fire from "../Fire/Fire";
import ISS from "../ISS/ISS";
import wiggleVertex from "./shaders/wiggleVertex.glsl?raw";
import wiggleFragment from "./shaders/wiggleFragment.glsl?raw";
import fogParsVertex from "./shaders/fogParsVertex.glsl?raw";
import fogVertex from "./shaders/fogVertex.glsl?raw";
import fogParsFragment from "./shaders/fogParsFragment.glsl?raw";
import fogFragment from "./shaders/fogFragment.glsl?raw";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type Mouse from "@/webgl/controllers/Mouse";
import Stars from "../Stars/Stars";
import Clouds from "../Clouds/Clouds";

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
  private wiggleShaderUniforms: { [uniform: string]: IUniform<any> } = {
    'uWiggleDirection': { value: new Vector2() },
    'uWiggleRatio': { value: 4. }
  };
  private fogShaderUniforms: { [uniform: string]: IUniform<any> } = {
    '_uFogColor': { value: new Color(0xffffff) },
    '_uFogTime': { value: this.time.elapsed },
    '_uFogCameraPosition': { value: this.camera.instance?.position }
  };
  private isDisplayed = false;
  private halo: Mesh | null = null;
  public fire: Fire | null = null;
  public ISS: ISS | null = null;
  public stars: Stars | null = null;
  public clouds: Clouds | null = null;

  constructor() {
    this.setMesh();
    this.setHalo();
    this.setDebug();
    
    this.fire = new Fire();
    this.ISS = new ISS();
    this.stars = new Stars();
    this.clouds = new Clouds(4);
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
        this.textures[index].flipY = false;
        this.textures[index].encoding = sRGBEncoding;
        model.scene.traverse((child) => {
          if(child instanceof Mesh && this.textures) {
            if (child.name === "maison" || child.name === "ville" || child.name === "mamie") {
              const wiggleMaterial = new ShaderMaterial({
                uniforms: {
                  ...this.wiggleShaderUniforms,
                  uBakedTexture: { value: this.textures[index] }
                },
                vertexShader: wiggleVertex,
                fragmentShader: wiggleFragment
              })
              if (child.name === "ville") {
                child.rotateY(Math.PI * .13);
              } else if (child.name === "maison") {
                child.rotateY(Math.PI * .65);
              } else if (child.name === "mamie") {
                wiggleMaterial.side = DoubleSide;
                child.rotateY(Math.PI * -.1);
              }
              child.material = wiggleMaterial;
            } else {
              const bakedMaterial = new MeshBasicMaterial({ map: this.textures[index] });
              child.material = bakedMaterial;
            }
            // child.material.onBeforeCompile = this.addCustomFog;
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
      this.wiggleShaderUniforms.uWiggleDirection.value = this.mouse.mouseInertia.clone();
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

  addCustomFog = (shader: Shader) => {
    shader.uniforms = {
      ...shader.uniforms,
      ...this.fogShaderUniforms
    }
    shader.vertexShader = shader.vertexShader.replace("#include <fog_pars_vertex>", fogParsVertex);
    shader.vertexShader = shader.vertexShader.replace("#include <fog_vertex>", fogVertex);
    shader.fragmentShader = shader.fragmentShader.replace("#include <fog_pars_fragment>", fogParsFragment);
    shader.fragmentShader = shader.fragmentShader.replace("#include <fog_fragment>", fogFragment);
  }

  setHalo() {
    const geometry = new PlaneBufferGeometry(5.7, 5.7);
    const material = new MeshBasicMaterial({
      map: this.loaders.items["earth-halo"] as Texture,
      transparent: true
    });
    this.halo = new Mesh(geometry, material);
    const { x, y, z } = this.camera.instance?.position as Vector3;
    this.halo.position.set(-x, -y, -z);
    this.halo.lookAt(0, 0, 0);
    this.scene.add(this.halo);
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

    this.fogShaderUniforms._uFogTime.value = this.time.elapsed;

    const { x, y } = this.wiggleShaderUniforms.uWiggleDirection.value;
    this.wiggleShaderUniforms.uWiggleDirection.value = { x: x - x/20, y: y - y/20 };

    this.ISS?.update();
    this.fire?.update();
    this.stars?.update();
    this.clouds?.update();
  }

  updateRelatedToCamera() {
    this.fogShaderUniforms._uFogCameraPosition.value = this.camera.instance?.position;

    if (this.halo) {
      const { x, y, z } = this.camera.instance?.position as Vector3;
      this.halo.position.set(-x, -y, -z);
      this.halo.lookAt(0, 0, 0);
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });
      this.debugFolder?.addInput(this.wiggleShaderUniforms.uWiggleRatio, "value", {
        min: 0, max: 7, label: "wiggle"
      });
    }
  }
}
