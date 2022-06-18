import { defineStore } from "pinia";

export const useCounterStore = defineStore({
  id: "seedGame",
  state: () => ({
    counter: 0,
    trees: [],
    lumberjacks: [],
  }),
  getters: {
    //TODO: model trees and lumberjacks
    // getTrees: (state) => state.trees,
    // getOneTree: (id: number) => state.tree.filter((t) => t.id === id),
    // getLumberjacks: () => state.lumberjacks,
    // getOneLumberjack: (id: number) =>
    //   state.lumberjacks.filter((l) => l.id === id),

    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    // addTrees
  },
});
