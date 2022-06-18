import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import Camera from "@/webgl/world/Camera";
import type Renderer from "@/webgl/Renderer";
import { Group, MeshBasicMaterial, Scene, Mesh, Texture, sRGBEncoding, DoubleSide, type IUniform, Vector2, Color, type Shader, PlaneBufferGeometry, Vector3, BoxBufferGeometry, BackSide } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import Fire from "./Fire/Fire";
import ISS from "./ISS/ISS";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type Mouse from "@/webgl/controllers/Mouse";
import Stars from "./Stars/Stars";
import Clouds from "./Clouds/Clouds";

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

import type { GPSPos } from "@/models/webgl/GPSPos.model";
import calcGPSFromPos from "@/utils/calcGPSFromPos";
import anime from "animejs";
import calcPosFromGPS from "@/utils/calcPosFromGPS";
import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import signal from 'signal-js';
import Ashes from "./Ashes/Ashes";

export default class Earth {
  private experience: Experience = new Experience();
  public scene: Scene = new Scene();
  public cameraPos: Vector3 = new Vector3(500, 0, 0);
  private time: Time = this.experience.time as Time;
  public camera: Camera = new Camera(this.cameraPos, this.scene);
  private renderer: Renderer = this.experience.renderer as Renderer;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private debug: Debug = this.experience.debug as Debug;
  private debugTab: FolderApi | undefined = undefined;
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
    uBrazierTexture: { value: this.loaders.items["earth:brazier-texture"] },
    uBrazierRandomRatio: { value: 5 },
  };
  private halo: Mesh | null = null;
  public fire: Fire | null = null;
  public ISS: ISS | null = null;
  public stars: Stars | null = null;
  // public ashes: Ashes | null = null;
  public clouds: Clouds | null = null;

  private hoveredDistrict = this.experience.renderer?.hoveredScene;
  private isHoveringDistrict: boolean = false;
  private shift = { lat: 20, lon: 0 };
  private districtPositions = [
    {
      name: "mamie",
      pos: {
        lat: -10 - this.shift.lat,
        lon: 170 - this.shift.lon,
      },
    },
    {
      name: "ville",
      pos: {
        lat: 30 - this.shift.lat,
        lon: -65 - this.shift.lon,
      },
    },
    {
      name: "maison",
      pos: {
        lat: 40 - this.shift.lat,
        lon: 30 - this.shift.lon,
      },
    },
  ];

  constructor() {
    this.setMesh();
    this.setHalo();
    this.setEvents();
    this.setSkybox();
    
    this.fire = new Fire(this.scene);
    this.ISS = new ISS(this.scene);
    this.stars = new Stars(this.scene);
    // this.ashes = new Ashes(this.scene);
    this.clouds = new Clouds(6, this.scene);

    this.setDebug();
  }

  setMesh() {
    this.models = [
      this.loaders.items["earth:oceans-model"] as GLTF,
      this.loaders.items["earth:continents-model"] as GLTF,
      this.loaders.items["earth:home-model"] as GLTF,
      this.loaders.items["earth:city-model"] as GLTF,
      this.loaders.items["earth:grandma-model"] as GLTF,
      this.loaders.items["earth:zones-model"] as GLTF,
    ];
    this.textures = [
      this.loaders.items["earth:oceans-texture"] as Texture,
      this.loaders.items["earth:continents-texture"] as Texture,
      this.loaders.items["earth:home-texture"] as Texture,
      this.loaders.items["earth:city-texture"] as Texture,
      this.loaders.items["earth:grandma-texture"] as Texture,
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
              const wiggleMaterial = new ShaderBaseMaterial({
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
                map: this.textures[index]
              });
              child.material = bakedMaterial;
            }
            child.material.onBeforeCompile = (shader: Shader) => {
              // this.addCustomFog(shader);
              this.addBrazierShader(shader);
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
        });
        this.earthGroup.add(this.zones);
      }
    });

    signal.on("mouse_grab", () => {
      if (!this.experience.world?.PARAMS.isMaintenanceOn) {
        this.wiggleShaderUniforms.uWiggleDirection.value = this.mouse.mouseInertia.clone();
      }
    });
    this.scene?.add(this.earthGroup);

    // this.earthGroup.position.y = -2;
    // this.earthGroup.scale.set(0, 0, 0);
    // this.earthGroup.rotation.y = Math.PI;
    // signal.on("start_experience", () => this.appear());    
  }

  setSkybox() {
    const up = this.loaders.items["earth:skyboxUP-texture"] as Texture;
    const dn = this.loaders.items["earth:skyboxDN-texture"] as Texture;
    const ft = this.loaders.items["earth:skyboxFT-texture"] as Texture;
    up.encoding = sRGBEncoding;
    dn.encoding = sRGBEncoding;
    ft.encoding = sRGBEncoding;
    const geometry = new BoxBufferGeometry(600, 600, 600);
    const materialArray = [];
    materialArray.push(new MeshBasicMaterial({ side: BackSide, map: ft }));
    materialArray.push(new MeshBasicMaterial({ side: BackSide, map: ft }));
    materialArray.push(new MeshBasicMaterial({ side: BackSide, map: up }));
    materialArray.push(new MeshBasicMaterial({ side: BackSide, map: dn }));
    materialArray.push(new MeshBasicMaterial({ side: BackSide, map: ft }));
    materialArray.push(new MeshBasicMaterial({ side: BackSide, map: ft }));
    const skybox = new Mesh(geometry, materialArray);
    this.scene.add(skybox);
  }

  appear() {
    const tl = anime.timeline({});
    tl.add({
      targets: this.earthGroup.position,
      y: 0,
      duration: 1000,
      easing: 'steps(20)'
    }, 0);
    tl.add({
      targets: this.earthGroup.scale,
      x: 1,
      y: 1,
      z: 1,
      duration: 1000,
      easing: 'steps(20)'
    }, 0);
    tl.add({
      targets: this.earthGroup.rotation,
      y: 0,
      duration: 1000,
      easing: 'steps(20)'
    }, 0);
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
      map: this.loaders.items["earth:halo"] as Texture,
      transparent: true,
    });
    this.halo = new Mesh(geometry, material);
    const { x, y, z } = this.camera.instance?.position as Vector3;
    this.halo.position.set(-x, -y, -z);
    this.halo.lookAt(0, 0, 0);
    this.scene?.add(this.halo);
  }

  setEvents() {
    signal.on("mouse_down", () => this.getIntersect());

    signal.on("mouse_up", () => {
      this.hoveredDistrict = this.experience.renderer?.hoveredScene;
      if (this.hoveredDistrict) {
        signal.emit("district_selected", this.hoveredDistrict);
        const districtPos = this.districtPositions.filter(
          (district) => district.name === this.hoveredDistrict?.name
        )[0].pos;
        this.rotateTo(districtPos);
      }
    });

    signal.on("mouse_move", () => {
      this.getIntersect();
      this.hoveredDistrict = this.experience.renderer?.hoveredScene;
      if (this.hoveredDistrict) {
        signal.emit("district_hovered");
        this.isHoveringDistrict = true;
      }
      if (this.isHoveringDistrict && !this.hoveredDistrict) {
        signal.emit("no_district_hovered");
        this.isHoveringDistrict = false;
      }
    });

    signal.on("mouse_grab", () => {
      signal.emit("no_district_selected");
    });
  }

  unSetEvents() {
    signal.off("mouse_down");
    signal.off("mouse_up");
    signal.off("mouse_grab");
  }

  getIntersect() {
    if (!this.experience.world?.PARAMS.isMaintenanceOn) {
      const intersects = this.renderer.raycast();
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

  rotateTo(newGPSPos: GPSPos) {
    const radius = this.camera?.instance?.position.distanceTo(
      new Vector3()
    );
    const currentGPSPos = calcGPSFromPos(
      this.camera?.instance?.position as Vector3,
      this.camera?.instance?.position.distanceTo(
        new Vector3()
      ) as number
    );

    const dist1 = Math.round(Math.abs(currentGPSPos.lon - newGPSPos.lon));
    const dist2 = Math.round(360 - dist1);
    const min = Math.min(dist1, dist2);
    const sign = -Math.sign(
      ((newGPSPos.lon + 180 + (360 - (currentGPSPos.lon + 180))) % 360) - 180
    );

    newGPSPos.lon = currentGPSPos.lon + min * sign;

    if (this.experience?.world?.controls) {
      this.experience.world.controls.enableRotate = false;
    }

    const tl = anime.timeline({});
    tl.add(
      {
        targets: currentGPSPos,
        lat: newGPSPos.lat,
        lon: newGPSPos.lon,
        easing: "easeInOutQuart",
        duration: 1000,
        update: () => {
          const newPos = calcPosFromGPS(currentGPSPos, radius as number);
          this.camera?.instance?.position.copy(newPos);
        },
        complete: () => {
          if (this.experience?.world?.controls) {
            this.experience.world.controls.enableRotate = true;
          }
        },
      },
      0
    );
  }

  setDebug() {
    if (this.debug.active) {
      this.debugTab = this.debug.ui?.pages[1].addFolder({ title: "Earth" });
      this.debugTab?.addInput(this.wiggleShaderUniforms.uWiggleRatio, "value", { min: 0, max: 7, label: "wiggle" });
      this.debugTab?.addInput(this.brazierShaderUniforms.uBrazierThreshold, "value", { min: -1.5, max: 2.5, label: "brazier Y" });
      this.debugTab?.addInput(this.brazierShaderUniforms.uBrazierRange, "value", { min: 0, max: 2, label: "brazier range" });
      this.debugTab?.addInput(this.brazierShaderUniforms.uBrazierRandomRatio, "value", { min: 0, max: 20, label: "brazier random" });
      const outroBtn = this.debugTab?.addButton({ title: "Start Outro" });
      outroBtn?.on("click", () => {
        signal.emit("outro:start");
      })
    }
  }

  destroy() {
    this.unSetEvents();
  }
}
