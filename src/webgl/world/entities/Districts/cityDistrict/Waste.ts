import Experience from "@/webgl/Experience";
import { BoxBufferGeometry, Group, Mesh, MeshBasicMaterial, Object3D } from "three";
import type Scoreboard from "../homeDistrict/SeedGame/Scoreboard";
import type CityDistrict from "./CityDistrict";

interface position {
  x: number,
  y: number,
  z: number
}

export default class Waste {
    static FALL_SPEED: number = .01;
    static DESPAWN_HEIGHT: number = .4;
    static SPAWN_COOLDOWN: number = 1000;
    static SPAWN_POS: position[] = [
      { x: -.5, y: 2.6, z: 3.5 },
      { x: -.1, y: 2.6, z: 3.5 },
      { x: .3, y: 2.6, z: 3.5 },
      
      { x: -.5, y: 2, z: 3.5 },
      { x: -.1, y: 2, z: 3.5 },
      { x: .3, y: 2, z: 3.5 },
  
      { x: -.5, y: 1.3, z: 3.5 },
      { x: -.1, y: 1.3, z: 3.5 },
      { x: .3, y: 1.3, z: 3.5 }
    ]

    static lastSpawn: number = 0;

    static wasteInstances: Waste[] = [];
    static wasteMeshes: Group = new Group();

    static geometry: BoxBufferGeometry = new BoxBufferGeometry(.1, .1, .1);
    static material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0xff0000 });
    
    private mesh: Mesh | null;
    
    private experience: Experience = new Experience();
    private cityDistrict: CityDistrict = this.experience.world?.districts?.cityDistrict as CityDistrict;
    private scoreboard: Scoreboard = this.experience.world?.districts?.scoreboard as Scoreboard;

  constructor() {
    this.mesh = new Mesh(Waste.geometry, Waste.material);
    const pos = Waste.SPAWN_POS[Math.floor(Math.random() * Waste.SPAWN_POS.length)];
    this.mesh.position.set(pos.x, pos.y, pos.z);
    Waste.wasteMeshes.add(this.mesh);
    Waste.wasteInstances.push(this);
  }

  update() {
      if (this.mesh?.position.y) {
        if (this.mesh.position.y < Waste.DESPAWN_HEIGHT) {
            this.destroy();
        } else if (this.mesh.position.y < .6 && this.mesh.position.x === this.cityDistrict.trash?.mesh?.position.x) {
            this.scoreboard.increaseScore();
            this.destroy();
        } else {
            this.mesh.position.y -= Waste.FALL_SPEED;
        }
    }
  }

  destroy() {
    Waste.wasteMeshes.remove(this.mesh as Object3D);
    Waste.wasteInstances.splice(Waste.wasteInstances.findIndex((el) => el === this), 1);
  }

  static destroy() {
      Waste.geometry.dispose();
      Waste.material.dispose();
      Waste.lastSpawn = 0;
      Waste.wasteInstances = [];
      while (Waste.wasteMeshes.children.length) {
          Waste.wasteMeshes.remove(Waste.wasteMeshes.children[0]);
      }
  }
}
