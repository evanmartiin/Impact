import { defineStore, type StoreDefinition } from "pinia";

interface IState {
  currentRoute: "home" | "seedGame" | "useSeedGameScores";
}
interface IGetters {}

interface IActions {}

type TGlobalStoreDef = StoreDefinition<"global", IState, IGetters, IActions>;

export type TGlobalStore = ReturnType<TGlobalStoreDef>;

export const useGlobal: TGlobalStoreDef = defineStore({
  id: "global",
  state: () => {
    return {
      currentRoute: "home",
    };
  },

  getters: {},

  actions: {},
});
