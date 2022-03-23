import type { ISource } from "@/models/webgl/source.model";

const Sources: ISource[] = [
  {
    name: "earthHeightTexture",
    type: "texture",
    path: "/textures/earth-height.png",
  },
  {
    name: "earthDiffuseTexture",
    type: "texture",
    path: "/textures/earth-texture.jpeg",
  },
  {
    name: "earthBumpTexture",
    type: "texture",
    path: "/textures/earth-bump.jpeg",
  },
  {
    name: "earthSpecularTexture",
    type: "texture",
    path: "/textures/earth-specular.gif",
  },
  {
    name: "earthTestTexture",
    type: "texture",
    path: "/textures/earth-test.png",
  },
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
    name: "earth",
    type: "gltfModel",
    path: "/models/earth.glb",
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
];

export default Sources;
