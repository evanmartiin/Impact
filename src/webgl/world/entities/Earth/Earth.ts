import type Debug from "@/controllers/globalControllers/Debug";
import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import type { GPSPos } from "@/models/webgl/GPSPos.model";
import { IcosahedronGeometry, Mesh, MeshStandardMaterial, Scene } from "three";
import type { FolderApi } from "tweakpane";
import Experience from "@/webgl/Experience";
import Tree from "../Tree/Tree";
import beginVertex from "./shaders/beginVertex.glsl?raw";
import commonFragment from "./shaders/commonFragment.glsl?raw";
import commonVertex from "./shaders/commonVertex.glsl?raw";
import outputFragment from "./shaders/outputFragment.glsl?raw";
// import vert from './vert.glsl?raw'
// import frag from './frag.glsl?raw'

export default class Earth {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private geometry: IcosahedronGeometry | null = null;
  private material: MeshStandardMaterial | null = null;
  private mesh: Mesh | null = null;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined;
  private trees: Tree[] | null = null;

  constructor() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setCubes();

    this.setDebug();
  }

  setGeometry() {
    this.geometry = new IcosahedronGeometry(3, 5);
  }

  setMaterial() {
    this.material = new MeshStandardMaterial({ flatShading: true });
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.scale = { value: 3 };
      shader.uniforms.texture1 = { value: this.loaders.items.earthTestTexture };

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        commonVertex
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        beginVertex
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        commonFragment
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        outputFragment
      );
    };

    // this.material = new ShaderMaterial({
    //     uniforms: {
    //         scale: {
    //             value: 3.5
    //         },
    //         texture1: {
    //             value: this.loaders.items.earthTestTexture
    //         }
    //     },
    //     vertexShader: vert,
    //     fragmentShader: frag
    // })
  }

  setMesh() {
    if (this.geometry && this.material) {
      this.mesh = new Mesh(this.geometry, this.material);
      this.mesh.rotation.x = -Math.PI * 0.5;
      this.mesh.receiveShadow = true;
      this.scene.add(this.mesh);
    }
  }

  setCubes() {
    const GPSPosArray: GPSPos[] = [];

    for (let i = 0; i < 100; i++) {
      GPSPosArray.push({
        lat: Math.round(Math.random() * 360 - 180),
        lon: Math.round(Math.random() * 360 - 180),
      });
    }

    GPSPosArray.forEach((GPSpos: GPSPos) => {
      const cube = new Tree(GPSpos.lat, GPSpos.lon);
      this.trees?.push(cube);
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Earth" });

      if (this.material) {
        this.debugFolder?.addInput(this.material, "wireframe", {
          min: 2,
          max: 15,
          step: 0.01,
        });
      }

      const _detail = { detail: this.geometry?.parameters.detail || 10 };
      const inputDetail = this.debugFolder?.addInput(_detail, "detail", {
        min: 1,
        max: 20,
        step: 1,
      });
      inputDetail?.on("change", () => {
        if (this.mesh) this.scene.remove(this.mesh);
        this.mesh?.geometry.dispose();
        this.geometry = null;
        this.geometry = new IcosahedronGeometry(
          3,
          parseInt(_detail.detail.toString())
        );
        this.setMesh();
      });
    }
  }
  destroy() {
    this.trees?.map((tree) => tree.destroy());
  }
}
