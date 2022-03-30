import type Loaders from "@/controllers/webglControllers/Loaders/Loaders";
import type { GPSPos } from "@/models/webgl/GPSPos.model";
import { Group, Mesh, MeshToonMaterial, Object3D, Scene } from "three";
import Experience from "@/webgl/Experience";
import TreeMaterial from "./TreeMaterial";

export default class Tree {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private loaders: Loaders = this.experience.loaders as Loaders;
  private material: MeshToonMaterial = new TreeMaterial()
    .material as MeshToonMaterial;
  private resource: Group;
  private _model: Group;
  private GPSPos: GPSPos;

  constructor(lat: number, lon: number) {
    this.GPSPos = { lat, lon };
    this.resource = this.loaders.items.tree2.scene;

    this._model = this.resource.clone();

    this.setModel();
  }

  setModel() {
    this._model.scale.set(0.2, 0.2, 0.2);
    this.setPos();

    this._model.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        child.material = this.material;
      }
    });

    this.scene.add(this._model);
  }

  setPos() {
    const _pos = calcPosFromGPS(this.GPSPos.lat, this.GPSPos.lon, 3.5);
    this._model.position.set(_pos.x, _pos.y, _pos.z);

    const _lookAt = calcPosFromGPS(this.GPSPos.lat, this.GPSPos.lon, 4);
    this._model.lookAt(_lookAt.x, _lookAt.y, _lookAt.z);

    this._model.rotateX(Math.PI / 2);
  }

  destroy() {
    this._model.traverse((child) => {
      if (child.name == "inscriptArc") {
        this.scene.remove(child);
      }
    });
    this.resource.remove();
    this.material.dispose();
  }
}

const calcPosFromGPS = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return { x, y, z };
};
