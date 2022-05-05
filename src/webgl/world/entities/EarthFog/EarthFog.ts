import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import Experience from "@/webgl/Experience";
import type Camera from "@/webgl/world/Camera";
import anime from "animejs";
import { Group, MeshBasicMaterial, Scene, Mesh, Texture, sRGBEncoding, DoubleSide, type IUniform, Vector2, SphereBufferGeometry, ShaderMaterial, ShaderChunk, Fog, FogExp2 } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "@/webgl/controllers/Time";
import Fire from "../Fire/Fire";
import ISS from "../ISS/ISS";
import vert from "./shaders/vert.glsl?raw";
import frag from "./shaders/frag.glsl?raw";
import type Debug from "@/webgl/controllers/Debug";
import type { FolderApi } from "tweakpane";
import type Mouse from "@/webgl/controllers/Mouse";

export default class EarthFog {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private camera: Camera = this.experience.camera as Camera;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private material: ShaderMaterial | null = null;

  constructor() {
    ShaderChunk.fog_pars_vertex = `
    #ifdef USE_FOG
      varying vec3 vWorldPosition;
    #endif
    `
    ShaderChunk.fog_vertex = `
    #ifdef USE_FOG
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
    #endif
    `
    ShaderChunk.fog_pars_fragment = `
    #ifdef USE_FOG
      uniform vec3 fogColor;
      varying vec3 vWorldPosition;
    #endif
    `
    ShaderChunk.fog_fragment = `
    #ifdef USE_FOG
      float fogDepth = length(vWorldPosition) - .9;
      fogDepth *= 5.;
      fogDepth = 1. - fogDepth;

      gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogDepth );
    #endif
    `
    // this.scene.fog = new Fog(0xffffff);

    // this.setMesh();
    // this.setDebug();
  }

  setMesh() {
    const geometry = new SphereBufferGeometry(1.05);
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: this.time.elapsed },
        uEarthMap: { value: this.loaders.items["earth-map"] }
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true
    });
    const mesh = new Mesh(geometry, this.material);
    mesh.position.set(.02, .05, -.02);
    this.scene.add(mesh);
  }

  update() {
    if (this.material) {
      this.material.uniforms.uTime.value = this.time.elapsed;
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Fog" });
    }
  }
}
