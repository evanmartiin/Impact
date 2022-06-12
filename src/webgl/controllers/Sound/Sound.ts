import type { SoundSource } from "@/models/webgl/sound.model";
import { Howl } from "howler";
import signal from 'signal-js';

interface Sprite {
  name: string;
  sound: Howl;
}

export default class Sound {
  static isOn: boolean = true;

  private sources: SoundSource[] = [];
  private sounds: Sprite[] = [];

  constructor(sources: SoundSource[]) {
    this.sources = sources;
    this.setSounds();
    signal.on("toggle_sound", this.toggleSound);
    signal.on("play_sound", (name: string) => this.play(name));
  }

  setSounds() {
    this.sources.forEach((source: SoundSource) => {
      const howl: Howl = new Howl(source.params);
      this.sounds.push({ name: source.name, sound: howl });
    });
  }

  toggleSound() {
    Sound.isOn = !Sound.isOn;
    const volume = Sound.isOn ? 1 : 0;
    Howler.volume(volume);
  }

  play(name: string): Howl | undefined {
    let result: Howl | undefined;

    const search = this.sounds.find((el) => el.name === name);
    if (search) {
      search.sound.play();
    }

    result = search?.sound ? search.sound : undefined;

    return result;
  }

  playMany(names: string[]): Sprite[] {
    const sounds: Sprite[] = [];

    names.forEach((childName) => {
      const sound = this.play(childName);
      sounds.push({ name: childName, sound: sound as Howl });
    });

    return sounds;
  }
}
