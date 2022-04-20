import type { ISource } from "@/models/webgl/source.model";

const Sources: ISource[] = [
  {
    name: "earthHeightTexture",
    type: "texture",
    path: "/textures/earth-height.png",
  },
  {
    name: "district1",
    type: "gltfModel",
    path: "/models/mapRoad.glb",
  },
  {
    name: "earthWithBuildingSketch",
    type: "gltfModel",
    path: "/models/earthWithBuildingSketch.glb",
  },
  {
    name: "character",
    type: "gltfModel",
    path: "/models/character.glb",
  },
  {
    name: "house",
    type: "gltfModel",
    path: "/models/house.glb",
  },
];

export default Sources;
