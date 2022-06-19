import type { ISource } from "@/types/webgl/source.model";

const pathPrefix = "/3dAssets/City";

const citySources: ISource[] = [
  {
    name: "city:map",
    type: "gltfModel",
    path: `${pathPrefix}/map-model.glb`,
  },
];
export default citySources;
