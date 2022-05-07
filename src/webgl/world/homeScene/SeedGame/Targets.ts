import { MeshStandardMaterial, SphereGeometry, Mesh, Group } from "three";
import getRandomFloatBetween from "@/utils/getRandomFloatBetween";
export default class Targets {
  private isInit = false;
  private isSet = false;
  private material: MeshStandardMaterial | null = null;
  private geometry: SphereGeometry | null = null;
  private mesh: Mesh | null = null;
  private spheres: Mesh[] = [];
  public instance: Group = new Group();

  constructor() {}

  init() {
    this.isInit = true;
    this.set();
  }

  setModel() {
    this.geometry = new SphereGeometry(0.2, 16, 16);
    this.material = new MeshStandardMaterial({ color: 0xff0000 });

    for (let i = 0; i < 7; i++) {
      const mesh = new Mesh(this.geometry, this.material);
      mesh.name = "target";
      mesh.position.set(
        getRandomFloatBetween(-2, 2, 2),
        0,
        getRandomFloatBetween(-2, 2, 2)
      );
      this.spheres.push(mesh);
      this.instance.add(mesh);
    }
    this.instance.position.z = 6;
    this.instance.position.y = 0.15;
  }

  set() {
    if (!this.init) {
      this.init();
    } else {
      if (!this.isSet) {
        // test
      }
    }
  }

  appear() {
    this.instance.visible = true;
  }
  disappear() {
    this.instance.visible = false;
  }

  unset() {
    if (this.isSet) {
    }
  }

  update() {}
}
