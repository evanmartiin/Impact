import Experience from "@/webgl/Experience";
import { defineStore } from "pinia";

export const webglStore = defineStore({
  id: "webgl",
  state: () => ({
    experience: new Experience(),
  }),
});
