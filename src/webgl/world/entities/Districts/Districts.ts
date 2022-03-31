import EventEmitter from "@/controllers/globalControllers/EventEmitter";
import type Mouse from "@/controllers/webglControllers/Mouse";
import calcGPSFromPos from "@/utils/calcGPSFromPos";
import calcPosFromGPS from "@/utils/calcPosFromGPS";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group, Vector3, type Scene } from "three";
import type { district } from "./../../../../models/district.model";
import type { GPSPos } from "./../../../../models/webgl/GPSPos.model";
import District1 from "./District1/district1";

export default class Districts extends EventEmitter {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private hoveredDistrict = this.experience.renderer?.hoveredDistrict;
  private instance: Group = new Group();
  private currentDistrict: district = "earth";
  public district1: District1 | null = null;

  private districtPositions = [
    {
      name: "mamie",
      pos: {
        lat: 20,
        lon: -180
      }
    },
    {
      name: "ville",
      pos: {
        lat: 40,
        lon: -30
      }
    },
    {
      name: "maison",
      pos: {
        lat: 19,
        lon: 72
      }
    }
  ]

  constructor() {
    super();

    this.setModels();

    this.mouse.on('click_start', () => {
      this.trigger('no_district_selected');
    });

    this.mouse.on('click_end', () => {
      this.hoveredDistrict = this.experience.renderer?.hoveredDistrict;
      if (this.hoveredDistrict) {
        this.trigger('district_selected', [this.hoveredDistrict]);
        const districtPos = this.districtPositions.filter((district) => district.name === this.hoveredDistrict?.name)[0].pos;
        this.rotateTo(districtPos);
      }
    })
  }

  rotateTo(newGPSPos: GPSPos) {
    const radius = this.experience.camera?.instance?.position.distanceTo(new Vector3());
    const currentGPSPos = calcGPSFromPos(this.experience.camera?.instance?.position as Vector3, this.experience.camera?.instance?.position.distanceTo(new Vector3()) as number);

    const dist1 = Math.round(Math.abs(currentGPSPos.lon - newGPSPos.lon));
    const dist2 = Math.round(360 - dist1);
    const min = Math.min(dist1, dist2);
    const sign = -Math.sign((((newGPSPos.lon + 180) + (360 - (currentGPSPos.lon + 180))) % 360) - 180);
    
    newGPSPos.lon = currentGPSPos.lon + min * sign;

    if (this.experience.camera?.controls) {
      this.experience.camera.controls.enableRotate = false;
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
          this.experience.camera?.instance?.position.copy(newPos);
        },
        complete: () => {
          if (this.experience.camera?.controls) {
            this.experience.camera.controls.enableRotate = true;
          }
        }
      },
      0
    );
  }

  setModels() {
    this.district1 = new District1();
    this.instance.add(this.district1.instance);
    this.scene.add(this.instance);
  }
  switchDistrict(district: district) {
    this.currentDistrict = district;
    switch (district) {
      case "earth":
        this.district1?.disappear();
        break;
      case "district1":
        this.district1?.appear();
        break;
      default:
        this.district1?.disappear();
        break;
    }
  }
}
