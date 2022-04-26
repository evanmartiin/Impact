import type Debug from "@/webgl/controllers/Debug";
import Experience from "@/webgl/Experience";
import { Scene, Mesh, BufferGeometry, PointsMaterial, SphereBufferGeometry, Points, BufferAttribute, AdditiveBlending } from "three";
import type { FolderApi } from "tweakpane";
import type Time from "@/webgl/controllers/Time";
import vert from './vert.glsl?raw'
import frag from './frag.glsl?raw'

export default class Sky {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private time: Time = this.experience.time as Time;
  private debug: Debug = this.experience.debug as Debug;
  private debugFolder: FolderApi | undefined = undefined;
  private geometry: BufferGeometry | null = null;
  private material: PointsMaterial | null = null;
  private mesh: Points | null = null;

  constructor() {
    this.setMesh();
    this.setDebug();
  }

  setMesh() {
    this.geometry = new BufferGeometry();
    const count = 500;

    const positions = new Float32Array(count * 3);

    for(let i = 0; i < count * 3; i+=3) {
      positions[i + 0] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    this.geometry.setAttribute('position', new BufferAttribute(positions, 3));

    this.material = new PointsMaterial({ size: .03, sizeAttenuation: true, blending: AdditiveBlending });
    this.mesh = new Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui?.addFolder({ title: "Sky" });
    }
  }
}
