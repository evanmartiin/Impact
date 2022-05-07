import calcGPSFromPos from "@/utils/calcGPSFromPos";
import calcPosFromGPS from "@/utils/calcPosFromGPS";
import EventEmitter from "@/webgl/controllers/EventEmitter";
import type Mouse from "@/webgl/controllers/Mouse";
import Experience from "@/webgl/Experience";
import anime from "animejs";
import { Group, Vector3, type Scene } from "three";
import type { district } from "./../../../../models/district.model";
import type { GPSPos } from "./../../../../models/webgl/GPSPos.model";
import CityDistrict from "./cityDistrict/CityDistrict";
import HomeDistrict from "./homeDistrict/HomeDistrict";
import Scoreboard from "./homeDistrict/SeedGame/Scoreboard";

export default class Districts extends EventEmitter {
  private experience: Experience = new Experience();
  private scene: Scene = this.experience.scene as Scene;
  private mouse: Mouse = this.experience.mouse as Mouse;
  private hoveredDistrict = this.experience.renderer?.hoveredDistrict;
  private instance: Group = new Group();
  private currentDistrict: district = "earth";
  public homeDistrict: HomeDistrict | null = null;
  public cityDistrict: CityDistrict | null = null;
  public scoreboard: Scoreboard | null = null;

  private shift = { lat: 30, lon: -20 };
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
    super();

    this.scoreboard = new Scoreboard();

    this.setModels();

    this.mouse.on("mousegrab", () => {
      this.trigger("no_district_selected");
    });

    this.mouse.on("mouseup", () => {
      this.hoveredDistrict = this.experience.renderer?.hoveredDistrict;
      if (this.hoveredDistrict) {
        this.trigger("district_selected", [this.hoveredDistrict]);
        const districtPos = this.districtPositions.filter(
          (district) => district.name === this.hoveredDistrict?.name
        )[0].pos;
        this.rotateTo(districtPos);
      }
    });
  }

  enableMovements() {
    document.addEventListener("keydown", (e) => {
      this.handleMovements(e);
    });
  }

  disableMovements() {
    document.removeEventListener("keydown", (e) => {
      this.handleMovements(e);
    });
  }

  handleMovements(e: any) {
    e = e || window.event;

    if (e.key === "ArrowLeft") {
      this.experience.camera?.rotate(-0.1);
    } else if (e.key === "ArrowRight") {
      this.experience.camera?.rotate(0.1);
    }
  }

  rotateTo(newGPSPos: GPSPos) {
    const radius = this.experience.camera?.instance?.position.distanceTo(
      new Vector3()
    );
    const currentGPSPos = calcGPSFromPos(
      this.experience.camera?.instance?.position as Vector3,
      this.experience.camera?.instance?.position.distanceTo(
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
        },
      },
      0
    );
  }

  setModels() {
    this.homeDistrict = new HomeDistrict();
    this.instance.add(this.homeDistrict.instance);
    this.cityDistrict = new CityDistrict();
    this.instance.add(this.cityDistrict.instance);
    this.scene.add(this.instance);
  }
  switchDistrict(district: district) {
    this.currentDistrict = district;

    switch (district) {
      case "earth":
        this.homeDistrict?.disappear();
        this.cityDistrict?.disappear();
        break;
      case "maison":
        this.homeDistrict?.appear();
        this.cityDistrict?.disappear();
        break;
      case "ville":
        this.homeDistrict?.disappear();
        this.cityDistrict?.appear();
        break;
      default:
        this.homeDistrict?.disappear();
        this.cityDistrict?.disappear();
        break;
    }
  }
  update() {
    this.homeDistrict?.update();
    this.homeDistrict?.update();
  }
}
