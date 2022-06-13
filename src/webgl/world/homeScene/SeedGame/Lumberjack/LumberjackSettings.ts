import { Vector3 } from "three";

const lamberjackSettings = {
  firstPerson: false,
  displayCollider: true,
  displayBVH: true,
  visualizeDepth: 10,
  gravity: -250,
  speed: 20,
  physicsSteps: 10,
  maxDistanceBetweenLJAndTree: 35,
  basePosition: new Vector3(0, 0.1, 1),
};
export default lamberjackSettings;
