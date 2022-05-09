import StatsGUI from "@/webgl/controllers/Stats";
import { Pane, TabApi } from "tweakpane";

export default class Debug {
  public active: boolean = window.location.hash === "#debug";
  public ui: TabApi | null = null;
  protected stats: StatsGUI | null = null;

  constructor() {
    if (this.active) {
      const pane = new Pane();

      this.ui = pane.addTab({
        pages: [
          { title: 'Global' },
          { title: 'Earth' },
          { title: 'Home' },
          { title: 'City' },
        ]
      })

      this.stats = new StatsGUI();
    }
  }

  update() {
    if (this.active) {
      this.stats?.update();
    }
  }
}