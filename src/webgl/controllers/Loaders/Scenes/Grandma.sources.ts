import type { ISource } from "@/types/webgl/source.model";

const pathPrefix = "/3dAssets/Grandma";

const grandmaSources: ISource[] = [
  {
    name: "grandma:map-model",
    type: "gltfModel",
    path: `${pathPrefix}/map-model.glb`,
  },
];
export default grandmaSources;
