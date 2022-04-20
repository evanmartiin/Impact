import type { ISource } from "@/models/webgl/source.model";

const Sources: ISource[] = [
  {
    name: "district1",
    type: "gltfModel",
    path: "/models/mapRoad.glb",
  },
  {
    name: "character",
    type: "gltfModel",
    path: "/models/character.glb",
  },
  {
    name: "earthv2",
    type: "gltfModel",
    path: "/models/earthv2.glb",
  },
];

export default Sources;
