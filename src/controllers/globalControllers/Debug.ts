import { hsvToRgb } from "@tweakpane/core/dist/cjs/input-binding/color/model/color-model";
import StatsGUI from "@/controllers/webglControllers/Stats";
import { Pane } from "tweakpane";

export default class Debug {
  public active: boolean = window.location.hash === "#debug";
  public ui: Pane | null = null;
  protected stats: StatsGUI | null = null;

  constructor() {
    if (this.active) {
      this.ui = new Pane({
        title: "Debug",
        expanded: true,
      });

      this.ui.addInput({ discord: true }, "discord");

      const exportBtn = this.ui.addButton({
        title: "Copy presets",
      });
      exportBtn.on("click", () => {
        const formattedTest: any = {};
        const discordInput: any = this.ui?.children.filter(
          (el: any) => el.label === "discord"
        )[0].controller_;

        const formatDiscord = discordInput?.binding.value.rawValue_;

        const folders = this.ui?.children.filter((el: any) => el.children);
        folders?.forEach((el: any) => {
          console.log(el);

          formattedTest[el.title] = {};

          const props = el.children;
          props.forEach((prop: any) => {
            const value = prop.controller_.binding.value.rawValue;

            if (["number", "string", "boolean"].includes(typeof value)) {
              formattedTest[el.title][prop.label] = value;
            } else if (typeof value === "object") {
              const color = RGBtoHex(
                hsvToRgb(
                  Math.floor(value.comps_[0]),
                  Math.floor(value.comps_[1]),
                  Math.floor(value.comps_[2])
                )
              );
              formattedTest[el.title][prop.label] = color;
            }
          });
        });

        navigator.permissions
          .query({ name: "clipboard-write" as PermissionName })
          .then((result) => {
            if (result.state == "granted" || result.state == "prompt") {
              const textToCopy = formatDiscord
                ? "```json\n" + JSON.stringify(formattedTest, null, 2) + "```"
                : JSON.stringify(formattedTest, null, 2);
              navigator.clipboard.writeText(textToCopy).catch(function () {
                console.log("Copy failed.");
              });
            }
          });
      });

      this.stats = new StatsGUI();
    }
  }

  update() {
    if (this.active) {
      this.stats?.update();
    }
  }
}

const colorToHex = (color: number) => {
  const hexadecimal = color.toString(16);
  return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
};

const RGBtoHex = (color: number[]) => {
  return (
    "#" +
    colorToHex(Math.floor(color[0])) +
    colorToHex(Math.floor(color[1])) +
    colorToHex(Math.floor(color[2]))
  );
};
