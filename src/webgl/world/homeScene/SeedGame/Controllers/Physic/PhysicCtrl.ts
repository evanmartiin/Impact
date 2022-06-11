import type { Mesh, Scene } from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";
import physicSettings from "./PhysicSettings";

export interface ICollider {
  id: number;
  collider: Mesh;
}
export interface IVisualizer {
  id: number;
  visualizer: MeshBVHVisualizer;
}

declare global {
  interface Window {
    physicCtrl: PhysicCtrl;
  }
}

export default class PhysicCtrl {
  static instance: PhysicCtrl;

  private scene: Scene | null = null;
  public colliders: ICollider[] = [];
  private visualizers: IVisualizer[] = [];
  public floorMesh: Mesh | null = null;
  private floorVisualizer: MeshBVHVisualizer | null = null;
  private lastId = 0;

  constructor(scene: Scene) {
    this.scene = scene;
    if (PhysicCtrl.instance) {
      return PhysicCtrl.instance;
    }
    PhysicCtrl.instance = this;

    // Global access
    window.physicCtrl = this;
  }

  addCollider(collider: Mesh): number {
    collider.geometry.boundsTree = new MeshBVH(collider.geometry);
    // const visualizer = new MeshBVHVisualizer(
    //   collider,
    //   physicSettings.visualizeDepth
    // );
    // visualizer.visible = physicSettings.displayBVH;
    // this.scene?.add(visualizer);
    const id = this.getNewId();
    this.colliders.push({ id, collider });
    // this.visualizers.push({ id, visualizer });
    // return this.visualizers.length - 1;
    return 1;
  }
  addFloor(mesh: Mesh) {
    mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);

    this.floorVisualizer = new MeshBVHVisualizer(
      mesh,
      physicSettings.visualizeDepth
    );
    this.floorMesh = mesh;

    this.scene?.add(this.floorVisualizer);
  }

  removeCollider(id: number) {
    const colliderIndex = this.colliders.findIndex((c) => c.id === id);
    const visualizerIndex = this.visualizers.findIndex((v) => v.id === id);
    this.scene?.remove(this.visualizers[visualizerIndex].visualizer);
    this.colliders.splice(colliderIndex, 1);
    this.visualizers.splice(visualizerIndex, 1);
  }

  getNewId() {
    const newID = this.lastId + 1;
    this.lastId = newID;
    return newID;
  }

  setBVHVisibility(state: boolean) {
    this.visualizers.map((v) => {
      v.visualizer.visible = state;
    });
  }
}
