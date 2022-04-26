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
    name: "earthv3",
    type: "gltfModel",
    path: "/models/earthv3.glb",
  },
  {
    name: "earthv4",
    type: "gltfModel",
    path: "/models/earthv4.glb",
  },
  {
    name: "earthv5",
    type: "gltfModel",
    path: "/models/earthv5.glb",
  },
  {
    name: "housev1",
    type: "gltfModel",
    path: "/models/housev1.glb",
  },
  {
    name: "city",
    type: "gltfModel",
    path: "/models/city.glb",
  },
  {
    name: "earth-baked-texture",
    type: "texture",
    path: "/textures/earth-baked.jpg",
  },
  {
    name: "earth-baked-model",
    type: "gltfModel",
    path: "/models/earth-baked.glb",
  },
  {
    name: "glb-example",
    type: "gltfModel",
    path: "/models/portal.glb",
  },
  {
    name: "baked-example",
    type: "texture",
    path: "/textures/baked.jpg",
  },
  {
    name: "satellite-model",
    type: "gltfModel",
    path: "/models/satellite.glb",
  },
  {
    name: "satellite-texture",
    type: "texture",
    path: "/textures/satellite.jpg",
  },
];

export default Sources;
