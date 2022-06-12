import type { SoundSource } from "@/models/webgl/sound.model";
import { Howl } from "howler";

interface Sprite {
  name: string;
  sound: Howl;
}

export default class Sound {
  private sources: SoundSource[] = [];
  private sounds: Sprite[] = [];

  constructor(sources: SoundSource[]) {
    this.sources = sources;
    this.setSounds();
  }

  setSounds() {
    this.sources.forEach((source: SoundSource) => {
      const howl: Howl = new Howl(source.params);
      this.sounds.push({ name: source.name, sound: howl });
    });
  }

  play(name: string | string[]): Howl | Sprite[] | undefined {
    let result: Howl | Sprite[] | undefined;

    if (name instanceof Array) {

      const sounds: Sprite[] = [];
      name.forEach((childName) => {
        const sound = this.play(childName);
        sounds.push({ name: childName, sound: sound as Howl });
      });

      result = sounds;

    } else {

      const search = this.sounds.find((el) => el.name === name);
      if (search) {
        search.sound.play();
      }

      result = search?.sound ? search.sound : undefined;
      
    }

    return result;
  }
}
