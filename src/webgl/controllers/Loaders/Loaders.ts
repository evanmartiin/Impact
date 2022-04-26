import EventEmitter from "@/webgl/controllers/EventEmitter";
import type { ILoaders, TfileLoader } from "@/models/webgl/loaders.model";
import type { ISource } from "@/models/webgl/source.model";
import { TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export default class Loaders extends EventEmitter {
  private sources: ISource[];
  public items: { [key: string]: TfileLoader };
  private toLoad: number | null = null;
  private loaded: number = 0;
  private loaders: ILoaders = {};

  constructor(sources: ISource[]) {
    super();

    this.sources = sources;
    this.items = {};
    this.toLoad = this.sources.length;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new TextureLoader();
    const draco = new DRACOLoader().setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');    
    this.loaders.gltfLoader.setDRACOLoader(draco);
  }

  startLoading() {
    if (this.sources) {
      // Load each source
      for (const source of this.sources) {
        if (source.type === "gltfModel") {
          this.loaders.gltfLoader?.load(source.path, (file) => {
            this.sourceLoaded(source, file);
          });
        } else if (source.type === "texture") {
          this.loaders.textureLoader?.load(source.path, (file) => {
            this.sourceLoaded(source, file);
          });
        }
      }
    }
  }

  sourceLoaded(source: ISource, file: TfileLoader) {
    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
