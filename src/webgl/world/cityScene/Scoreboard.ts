import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import signal from 'signal-js';

export default class Scoreboard {
  static instance: Scoreboard;

  private experience: Experience = new Experience();
  private time: Time = this.experience.time as Time;

  public isCounting: boolean = false;
  public score: number = 0;
  private startTime: number = 0;
  public elapsedTime: number = 0;

  private maxTime: number = 0;

  constructor() {}

  startTimer(MAX_TIME: number) {
    if (!this.isCounting) {
      this.maxTime = MAX_TIME;
      this.resetTimer();
      this.startTime = this.time.elapsed;
      signal.emit("timer_started");
      console.log(`Timer started for ${this.maxTime}ms.`);
    } else {
      console.log(`Timer already counting. (${this.elapsedTime}/${this.maxTime}ms)`);
    }
  }

  resetTimer() {
    this.elapsedTime = 0;
    this.score = 0;
    this.isCounting = !this.isCounting;
  }

  stopTimer() {
    signal.emit("timer_ended");
    console.log(`Timer ended at ${this.elapsedTime}ms.`);
    this.resetTimer();
  }

  increaseScore() {
    this.score++;
    console.log('Score:', this.score);
    signal.emit("score_changed", this.score);
  }

  update() {
    if (this.isCounting) {
      this.elapsedTime = this.time.elapsed - this.startTime;
      if (this.elapsedTime >= this.maxTime) {
        this.stopTimer();
      }
    }
  }
}
