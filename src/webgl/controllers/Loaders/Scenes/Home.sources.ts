import type { ISource } from "@/types/webgl/source.model";

const pathPrefix = "/3dAssets/Home";

const homeSources: ISource[] = [
  // HOUSE GRASS
  {
    name: "home:grass-model",
    type: "gltfModel",
    path: `${pathPrefix}/Map/grass-model.glb`,
  },
  {
    name: "home:grass-texture",
    type: "texture",
    path: `${pathPrefix}/Map/grass-texture.jpg`,
  },
  // HOUSE SCENE
  {
    name: "home:house-model",
    type: "gltfModel",
    path: `${pathPrefix}/Map/home-model.glb`,
  },
  {
    name: "home:house-texture",
    type: "texture",
    path: `${pathPrefix}/Map/home-texture.jpg`,
  },
  // TREES
  {
    name: "home:bigTree-model",
    type: "gltfModel",
    path: `${pathPrefix}/Trees/bigTree-model.glb`,
  },
  {
    name: "home:mediumTree-model",
    type: "gltfModel",
    path: `${pathPrefix}/Trees/mediumTree-model.glb`,
  },
  {
    name: "home:smallTree-model",
    type: "gltfModel",
    path: `${pathPrefix}/Trees/smallTree-model.glb`,
  },
  // SEED
  {
    name: "home:seed-model",
    type: "gltfModel",
    path: `${pathPrefix}/seed-model.glb`,
  },
  {
    name: "home:poppingTreesAndSeed-texture",
    type: "texture",
    path: `${pathPrefix}/poppingTreesAndSeed-texture.jpg`,
  },
  // PLANE
  {
    name: "home:plane-model",
    type: "gltfModel",
    path: `${pathPrefix}/Plane/plane-model.glb`,
  },
  {
    name: "home:plane-texture",
    type: "texture",
    path: `${pathPrefix}/Plane/plane-texture.png`,
  },
  // BIRD
  {
    name: "home:bird-model",
    type: "gltfModel",
    path: `${pathPrefix}/bird-model.glb`,
  },
  // SKYBOX HOME
  {
    name: "home:skyboxDN-texture",
    type: "texture",
    path: `${pathPrefix}/Skybox/dn-texture.jpg`,
  },
  {
    name: "home:skyboxUP-texture",
    type: "texture",
    path: `${pathPrefix}/Skybox/up-texture.jpg`,
  },
  {
    name: "home:skyboxFT-texture",
    type: "texture",
    path: `${pathPrefix}/Skybox/ft-texture.jpg`,
  },
];
export default homeSources;
