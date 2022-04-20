import type { ISource } from "@/models/webgl/source.model";

const Sources: ISource[] = [
  {
    name: "house",
    type: "gltfModel",
    path: "/models/district1.glb",
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
  {
    name: "housev1",
    type: "gltfModel",
    path: "/models/housev1.glb",
  },
];

export default Sources;
