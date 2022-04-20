import type { ISource } from "@/models/webgl/source.model";

const Sources: ISource[] = [
  {
    name: "tree",
    type: "gltfModel",
    path: "/models/tree.glb",
  },
  {
    name: "tree2",
    type: "gltfModel",
    path: "/models/arbre-moche.glb",
  },
  {
    name: "district1",
    type: "gltfModel",
    path: "/models/district1.glb",
  },
  {
    name: "map",
    type: "gltfModel",
    path: "/models/map.glb",
  },
  {
    name: "earthv1",
    type: "gltfModel",
    path: "/models/earthv1.glb",
  },
];

export default Sources;
