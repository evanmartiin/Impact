import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type Camera from "@/webgl/world/Camera";
import type Renderer from "@/webgl/Renderer";
import anime from "animejs";
import {
  Group,
  MeshBasicMaterial,
  Scene,
  Mesh,
  Texture,
  sRGBEncoding,
  DoubleSide,
  type IUniform,
  Vector2,
  ShaderMaterial,
  Color,
  type Shader,
  PlaneBufferGeometry,
  Vector3,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import Fire from "../Fire/Fire";
import ISS from "../ISS/ISS";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type Mouse from "@/webgl/controllers/Mouse";
import Stars from "../Stars/Stars";
import Clouds from "../Clouds/Clouds";

import wiggleVertex from "./shaders/wiggle/wiggleVertex.glsl?raw";
import wiggleFragment from "./shaders/wiggle/wiggleFragment.glsl?raw";

import fogParsVertex from "./shaders/customFog/fogParsVertex.glsl?raw";
import fogVertex from "./shaders/customFog/fogVertex.glsl?raw";
import fogParsFragment from "./shaders/customFog/fogParsFragment.glsl?raw";
import fogFragment from "./shaders/customFog/fogFragment.glsl?raw";

import brazierParsVertex from "./shaders/brazier/brazierParsVertex.glsl?raw";
import brazierVertex from "./shaders/brazier/brazierVertex.glsl?raw";
import brazierParsFragment from "./shaders/brazier/brazierParsFragment.glsl?raw";
import brazierFragment from "./shaders/brazier/brazierFragment.glsl?raw";

export default class Earth {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private camera: Camera = this.experience.camera as Camera;
  private renderer: Renderer = this.experience.renderer as Renderer;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  public earthGroup: Group = new Group();
  private models: GLTF[] | null = null;
  private textures: Texture[] | null = null;
  private zones: Group = new Group();
  private zoneMaterial: MeshBasicMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  private wiggleShaderUniforms: { [uniform: string]: IUniform<any> } = {
    uWiggleDirection: { value: new Vector2() },
    uWiggleRatio: { value: 4 },
  };
  private fogShaderUniforms: { [uniform: string]: IUniform<any> } = {
    _uFogColor: { value: new Color(0xffffff) },
    _uFogTime: { value: this.time.elapsed },
    _uFogCameraPosition: { value: this.camera.instance?.position },
  };
  private brazierShaderUniforms: { [uniform: string]: IUniform<any> } = {
    uBrazierThreshold: { value: -1.5 },
    uBrazierRange: { value: 0.2 },
    uBrazierTexture: { value: this.loaders.items["brazier-texture"] },
    uBrazierRandomRatio: { value: 5 },
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
    this.clouds = new Clouds(3);
  }

  setMesh() {
    this.models = [
      this.loaders.items["oceans-model"] as GLTF,
      this.loaders.items["continents-model"] as GLTF,
      this.loaders.items["house-mini-model"] as GLTF,
      this.loaders.items["city-mini-model"] as GLTF,
      this.loaders.items["granny-mini-model"] as GLTF,
      this.loaders.items["zones-model"] as GLTF,
    ];
    this.textures = [
      this.loaders.items["oceans-texture"] as Texture,
      this.loaders.items["continents-texture"] as Texture,
      this.loaders.items["house-mini-texture"] as Texture,
      this.loaders.items["city-mini-texture"] as Texture,
      this.loaders.items["granny-mini-texture"] as Texture,
    ];

    this.models.forEach((model, index) => {
      if (this.textures && this.textures[index]) {
        this.textures[index].flipY = false;
        this.textures[index].encoding = sRGBEncoding;
        model.scene.traverse((child) => {
          if (child instanceof Mesh && this.textures) {
            if (
              child.name === "maison" ||
              child.name === "ville" ||
              child.name === "mamie"
            ) {
              const wiggleMaterial = new ShaderMaterial({
                uniforms: {
                  ...this.wiggleShaderUniforms,
                  uBakedTexture: { value: this.textures[index] },
                },
                vertexShader: wiggleVertex,
                fragmentShader: wiggleFragment,
              });
              if (child.name === "ville") {
                child.rotateY(Math.PI * 0.13);
              } else if (child.name === "maison") {
                child.rotateY(Math.PI * 0.65);
              } else if (child.name === "mamie") {
                wiggleMaterial.side = DoubleSide;
                child.rotateY(Math.PI * -0.1);
              }
              child.material = wiggleMaterial;
            } else {
              const bakedMaterial = new MeshBasicMaterial({
                map: this.textures[index],
                transparent: true,
              });
              child.material = bakedMaterial;
            }
            // child.material.onBeforeCompile = this.addCustomFog;
            child.material.onBeforeCompile = this.addBrazierShader;
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
        });
        this.earthGroup.add(this.zones);
      }
    });

    this.mouse.on("mouse_grab", () => {
      this.wiggleShaderUniforms.uWiggleDirection.value =
        this.mouse.mouseInertia.clone();
    });
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
    this.setEvents();
  }

  addCustomFog = (shader: Shader) => {
    shader.uniforms = {
      ...shader.uniforms,
      ...this.fogShaderUniforms,
    };
    shader.vertexShader = shader.vertexShader.replace(
      "#include <fog_pars_vertex>",
      fogParsVertex
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <fog_vertex>",
      fogVertex
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <fog_pars_fragment>",
      fogParsFragment
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <fog_fragment>",
      fogFragment
    );
  };

  addBrazierShader = (shader: Shader) => {
    shader.uniforms = {
      ...shader.uniforms,
      ...this.brazierShaderUniforms,
    };
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      "#include <common>" + brazierParsVertex
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>" + brazierVertex
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      "#include <common>" + brazierParsFragment
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <output_fragment>",
      "#include <output_fragment>" + brazierFragment
    );
  };

  setHalo() {
    const geometry = new PlaneBufferGeometry(5.7, 5.7);
    const material = new MeshBasicMaterial({
      map: this.loaders.items["earth-halo"] as Texture,
      transparent: true,
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
      this.setEvents();
    }
  }

  setEvents() {
    this.mouse.on("mousedown", () => this.getIntersect());
  }
  unSetEvents() {
    this.mouse.off("mousedown");
  }

  getIntersect() {
    const intersects = this.renderer.raycast();
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
      this.unSetEvents();
    }
  }

  update() {
    this.zoneMaterial.opacity = (Math.cos(this.time.elapsed / 300) + 1) / 2;

    this.fogShaderUniforms._uFogTime.value = this.time.elapsed;

    const { x, y } = this.wiggleShaderUniforms.uWiggleDirection.value;
    this.wiggleShaderUniforms.uWiggleDirection.value = {
      x: x - x / 20,
      y: y - y / 20,
    };

    this.ISS?.update();
    this.fire?.update();
    this.stars?.update();
    this.clouds?.update();
  }

  updateRelatedToCamera() {
    this.fogShaderUniforms._uFogCameraPosition.value =
      this.camera.instance?.position;

    if (this.halo) {
      const { x, y, z } = this.camera.instance?.position as Vector3;
      this.halo.position.set(-x, -y, -z);
      this.halo.lookAt(0, 0, 0);
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });
      this.debugFolder?.addInput(
        this.wiggleShaderUniforms.uWiggleRatio,
        "value",
        { min: 0, max: 7, label: "wiggle" }
      );
      this.debugFolder?.addInput(
        this.brazierShaderUniforms.uBrazierThreshold,
        "value",
        { min: -1.5, max: 2.5, label: "brazier Y" }
      );
      this.debugFolder?.addInput(
        this.brazierShaderUniforms.uBrazierRange,
        "value",
        { min: 0, max: 2, label: "brazier range" }
      );
      this.debugFolder?.addInput(
        this.brazierShaderUniforms.uBrazierRandomRatio,
        "value",
        { min: 0, max: 20, label: "brazier random" }
      );
    }
  }
}
