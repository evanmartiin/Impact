import EventEmitter from "@/controllers/globalControllers/EventEmitter";

export default class Time extends EventEmitter {
  private start: number | null = null;
  private current: number | null = null;
  protected elapsed = 0;
  public delta = 16;

  constructor() {
    super();

    // Setup
    this.start = Date.now();
    this.current = this.start;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = Date.now();

    if (this.start && this.current) {
      this.delta = currentTime - this.current;
      this.current = currentTime;
      this.elapsed = this.current - this.start;
    }

    this.trigger("tick");

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
