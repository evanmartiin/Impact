import type { ISource } from "@/models/webgl/source.model";

const pathPrefix = "/3dAssets/Common";

const commonSources: ISource[] = [
  // COMMING SOON MODELS
  {
    name: "common:comingSoonMapsMatcap-texture",
    type: "texture",
    path: `${pathPrefix}/comingSoonMapsMatcap-texture.jpeg`,
  },
  // TRANSITION EFFECT
  {
    name: "common:paper-texture",
    type: "texture",
    path: `${pathPrefix}/paper-texture.jpg`,
  },
  // CLOUD
  {
    name: "common:cloud-model",
    type: "gltfModel",
    path: `${pathPrefix}/cloud-model.glb`,
  },
  // BILLY
  {
    name: "common:billy-model",
    type: "gltfModel",
    path: `${pathPrefix}/Characters/Billy/billy-model.glb`,
  },
  {
    name: "common:billy-texture",
    type: "texture",
    path: `${pathPrefix}/Characters/Billy/billy-texture.jpg`,
  },
  // LUMBERJACK
  {
    name: "common:lumberjack-model",
    type: "gltfModel",
    path: `${pathPrefix}/Characters/Lumberjack/lumberjack-model.glb`,
  },
];
export default commonSources;
