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
    name: "homeGameCharacter",
    type: "gltfModel",
    path: "/models/homeGameCharacter.glb",
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
    name: "seedMatCap",
    type: "texture",
    path: "/textures/seedMatCap.jpg",
  },
  {
    name: "grassv1texture",
    type: "texture",
    path: "/textures/bakedGrassv9.jpg",
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

  {
    name: "oceans-model",
    type: "gltfModel",
    path: "/models/oceans.glb",
  },
  {
    name: "oceans-texture",
    type: "texture",
    path: "/textures/oceans.jpg",
  },

  {
    name: "continents-model",
    type: "gltfModel",
    path: "/models/continents.glb",
  },
  {
    name: "continents-texture",
    type: "texture",
    path: "/textures/continents.jpg",
  },

  {
    name: "house-mini-model",
    type: "gltfModel",
    path: "/models/house-mini.glb",
  },
  {
    name: "house-mini-texture",
    type: "texture",
    path: "/textures/house-mini.jpg",
  },

  {
    name: "city-mini-model",
    type: "gltfModel",
    path: "/models/city-mini.glb",
  },
  {
    name: "city-mini-texture",
    type: "texture",
    path: "/textures/city-mini.jpg",
  },

  {
    name: "granny-mini-model",
    type: "gltfModel",
    path: "/models/granny-mini.glb",
  },
  {
    name: "granny-mini-texture",
    type: "texture",
    path: "/textures/granny-mini.jpg",
  },

  {
    name: "zones-model",
    type: "gltfModel",
    path: "/models/zones.glb",
  },
  {
    name: "grandma-model",
    type: "gltfModel",
    path: "/models/grandma.glb",
  },

  {
    name: "earth-map",
    type: "texture",
    path: "/textures/earth-map.png",
  },
  {
    name: "earth-halo",
    type: "texture",
    path: "/textures/earth-halo.png",
  },
  {
    name: "brazier-texture",
    type: "texture",
    path: "/textures/fire.jpeg",
  },
  {
    name: "paper-texture",
    type: "texture",
    path: "/textures/paper.jpg",
  },
  {
    name: "matcap-texture",
    type: "texture",
    path: "/textures/matcap.jpeg",
  },
  // HOUSE GRASS
  {
    name: "grassv1model",
    type: "gltfModel",
    path: "/models/HouseScene/grass.glb",
  },
  {
    name: "housev1texture",
    type: "texture",
    path: "/textures/HouseScene/bakedHouse.jpg",
  },
  // HOUSE SCENE
  {
    name: "housev1model",
    type: "gltfModel",
    path: "/models/HouseScene/house.glb",
  },
  {
    name: "housev1texture",
    type: "texture",
    path: "/textures/HouseScene/bakedHouse.jpg",
  },
  // BILLY
  {
    name: "billy-model",
    type: "gltfModel",
    path: "/models/Characters/Billy/billyModel.glb",
  },
  {
    name: "billy-texture",
    type: "texture",
    path: "/textures/Characters/Billy/billyTextureV2.jpg",
  },
  // LUMBERJACK
  {
    name: "lumberjack-model",
    type: "gltfModel",
    path: "/models/Characters/Lumberjack/lumberjack.glb",
  },
  // TREES
  {
    name: "big-tree-model",
    type: "gltfModel",
    path: "/models/Trees/bigTree.glb",
  },
  {
    name: "medium-tree-model",
    type: "gltfModel",
    path: "/models/Trees/mediumTree.glb",
  },
  {
    name: "small-tree-model",
    type: "gltfModel",
    path: "/models/Trees/smallTree.glb",
  },
  // SEED
  {
    name: "seed-model",
    type: "gltfModel",
    path: "/models/seed.glb",
  },
  {
    name: "poppingtrees-seed-texture",
    type: "texture",
    path: "/textures/poppingtrees-seed.jpg",
  },
  // NUAGE
  {
    name: "cloud-model",
    type: "gltfModel",
    path: "/models/nuage.glb",
  },
  // OISEAU
  {
    name: "bird-model",
    type: "gltfModel",
    path: "/models/Oiseaux.glb",
  },
  // AVION
  {
    name: "plane-model",
    type: "gltfModel",
    path: "/models/Avion.glb",
  },
  {
    name: "plane-texture",
    type: "texture",
    path: "/textures/matcap-plane.png",
  },
  // CENDRE
  {
    name: "ash-texture",
    type: "texture",
    path: "/textures/ash.png",
  },
  // SKYBOX HOME
  {
    name: "sky-home-dn",
    type: "texture",
    path: "/textures/skybox/home/dn.jpg",
  },
  {
    name: "sky-home-up",
    type: "texture",
    path: "/textures/skybox/home/up.jpg",
  },
  {
    name: "sky-home-ft",
    type: "texture",
    path: "/textures/skybox/home/ft.jpg",
  },
  // SKYBOX EARTH
  {
    name: "sky-earth-dn",
    type: "texture",
    path: "/textures/skybox/earth/dn.jpg",
  },
  {
    name: "sky-earth-up",
    type: "texture",
    path: "/textures/skybox/earth/up.jpg",
  },
  {
    name: "sky-earth-ft",
    type: "texture",
    path: "/textures/skybox/earth/ft.jpg",
  },
];

export default Sources;
