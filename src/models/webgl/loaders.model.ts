import type { Texture, TextureLoader } from "three";
import type { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
export interface ILoaders {
  gltfLoader?: GLTFLoader;
  textureLoader?: TextureLoader;
}

export type TfileLoader = Texture | GLTF;