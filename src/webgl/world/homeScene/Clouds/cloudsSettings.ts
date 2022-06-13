import { Vector3 } from "three";

export interface CloudParams {
  "pos": Vector3,
  "type": number,
  "scale": number,
  "rotateY": number,
  "rotateZ": number,
  "speed": number
}

const cloudsParams: CloudParams[] = [
  {
    "pos": new Vector3(-.22, .3, .35),
    "type": 0,
    "scale": .03,
    "rotateY": 3,
    "rotateZ": 3,
    "speed": 1
  },
  {
    "pos": new Vector3(.2, .35, -.3),
    "type": 0,
    "scale": .03,
    "rotateY": 3,
    "rotateZ": 3,
    "speed": .7
  },
  {
    "pos": new Vector3(-.39, .25, -.6),
    "type": 1,
    "scale": .008,
    "rotateY": 3,
    "rotateZ": 3,
    "speed": 1.4
  },
];

export default cloudsParams;