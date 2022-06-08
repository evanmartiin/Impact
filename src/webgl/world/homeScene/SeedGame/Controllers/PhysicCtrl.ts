import type { Mesh, Scene } from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";

export interface ICollider {
  id: number;
  collider: Mesh;
}
export interface IVisualizer {
  id: number;
  visualizer: MeshBVHVisualizer;
}

export default class PhysicCtrl {
  private scene: Scene | null = null;
  public colliders: ICollider[] = [];
  private visualizers: IVisualizer[] = [];
  private BVHDefaultVisibility = false;
  private lastId = 0;
  private params = {
    visualizeDepth: 10,
  };

  constructor(scene: Scene, BVHDefaultVisibility = false) {
    this.scene = scene;
    this.BVHDefaultVisibility = BVHDefaultVisibility;
  }

  addCollider(collider: Mesh): number {
    collider.geometry.boundsTree = new MeshBVH(collider.geometry);
    const visualizer = new MeshBVHVisualizer(
      collider,
      this.params.visualizeDepth
    );
    if (!this.BVHDefaultVisibility) visualizer.visible = false;
    this.scene?.add(visualizer);
    const id = this.getNewId();
    this.colliders.push({ id, collider });
    this.visualizers.push({ id, visualizer });
    return this.visualizers.length - 1;
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
