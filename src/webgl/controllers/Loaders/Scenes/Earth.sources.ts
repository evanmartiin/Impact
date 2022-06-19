import type { ISource } from "@/types/webgl/source.model";

const pathPrefix = "/3dAssets/Earth";

const earthSources: ISource[] = [
  // SATELLITE
  {
    name: "earth:satellite-model",
    type: "gltfModel",
    path: `${pathPrefix}/Satellite/satellite-model.glb`,
  },
  {
    name: "earth:satellite-texture",
    type: "texture",
    path: `${pathPrefix}/Satellite/satellite-texture.jpg`,
  },
  // OCEANS
  {
    name: "earth:oceans-model",
    type: "gltfModel",
    path: `${pathPrefix}/Earth/oceans-model.glb`,
  },
  {
    name: "earth:oceans-texture",
    type: "texture",
    path: `${pathPrefix}/Earth/oceans-texture.jpg`,
  },
  // CONTINENTS
  {
    name: "earth:continents-model",
    type: "gltfModel",
    path: `${pathPrefix}/Earth/continents-model.glb`,
  },
  {
    name: "earth:continents-texture",
    type: "texture",
    path: `${pathPrefix}/Earth/continents-texture.jpg`,
  },
  // HOME
  {
    name: "earth:home-model",
    type: "gltfModel",
    path: `${pathPrefix}/MiniScenes/home-model.glb`,
  },
  {
    name: "earth:home-texture",
    type: "texture",
    path: `${pathPrefix}/MiniScenes/home-texture.jpg`,
  },
  // CITY
  {
    name: "earth:city-model",
    type: "gltfModel",
    path: `${pathPrefix}/MiniScenes/city-model.glb`,
  },
  {
    name: "earth:city-texture",
    type: "texture",
    path: `${pathPrefix}/MiniScenes/city-texture.jpg`,
  },
  // GRANNY
  {
    name: "earth:grandma-model",
    type: "gltfModel",
    path: `${pathPrefix}/MiniScenes/grandma-model.glb`,
  },
  {
    name: "earth:grandma-texture",
    type: "texture",
    path: `${pathPrefix}/MiniScenes/grandma-texture.jpg`,
  },
  // CLICKABLE ZONES
  {
    name: "earth:zones-model",
    type: "gltfModel",
    path: `${pathPrefix}/zones-model.glb`,
  },
  // SKYBOX
  {
    name: "earth:skyboxDN-texture",
    type: "texture",
    path: `${pathPrefix}/Skybox/dn-texture.jpg`,
  },
  {
    name: "earth:skyboxUP-texture",
    type: "texture",
    path: `${pathPrefix}/Skybox/up-texture.jpg`,
  },
  {
    name: "earth:skyboxFT-texture",
    type: "texture",
    path: `${pathPrefix}/Skybox/ft-texture.jpg`,
  },
  // EARTH EFFECTS
  {
    name: "earth:halo",
    type: "texture",
    path: `${pathPrefix}/halo-texture.png`,
  },
  {
    name: "earth:brazier-texture",
    type: "texture",
    path: `${pathPrefix}/fire-texture.jpeg`,
  },
  // ASHTRAY
  {
    name: "earth:ash-texture",
    type: "texture",
    path: `${pathPrefix}/ash-texture.png`,
  },
];
export default earthSources;
