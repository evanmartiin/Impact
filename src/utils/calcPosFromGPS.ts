import type { GPSPos } from "@/models/webgl/GPSPos.model";
import { Vector3 } from "three";

const calcPosFromGPS = (GPSPos: GPSPos, radius: number): Vector3 => {
    const phi = (90 - GPSPos.lat) * (Math.PI / 180);
    const theta = (GPSPos.lon + 180) * (Math.PI / 180);
  
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
  
    return new Vector3(x, y, z);
};

export default calcPosFromGPS;