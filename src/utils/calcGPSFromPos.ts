import type { GPSPos } from "@/models/webgl/GPSPos.model";
import type { Vector3 } from "three";

const calcGPSFromPos = (vector: Vector3, radius: number): GPSPos => {
    radius = radius || 200;

    var latRads = Math.acos(vector.y / radius);
    var lonRads = Math.atan2(vector.z, vector.x);
    var lat = (Math.PI / 2 - latRads) * (180 / Math.PI);
    var lon = (Math.PI - lonRads) * (180 / Math.PI) - 180;

    return { lat, lon };
};

export default calcGPSFromPos;