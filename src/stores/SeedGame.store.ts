import { defineStore, type StoreDefinition } from "pinia";

interface IState {
  startingBlock: string;
  isStartingBlockDisplayed: boolean;
  isMenuDisplayed: boolean;
  currentWave: number;
  isCurrentWaveDisplayed: boolean;
  score: number;
  destroyedLumberjacks: number;
  plantedTrees: number;
  playerName: string;
}
interface IGetters {}

interface IActions {
  setStartingBlock: (value: string) => void;
  setStartingBlockDisplayment: (state: boolean) => void;
  setMenuDisplayment: (state: boolean) => void;
  setCurrentWave: (wave: number) => void;
  setCurrentWaveDisplayment: (state: boolean) => void;
  incrementScore: (value?: number) => void;
  incrementDestroyedLumberjacks: () => void;
  incrementPlantedTrees: () => void;
  setPlayerName: (name: string) => void;
}
type TSeedGameStoreDef = StoreDefinition<"seedGameStore", IState, IGetters, IActions>;

export type TSeedGameStore = ReturnType<TSeedGameStoreDef>;

export const useSeedGame: TSeedGameStoreDef = defineStore({
  id: "seedGameStore",
  state: () => {
    return {
      startingBlock: "0",
      isStartingBlockDisplayed: false as boolean,
      isMenuDisplayed: false as boolean,
      currentWave: 1,
      isCurrentWaveDisplayed: false as boolean,
      score: 0,
      destroyedLumberjacks: 0,
      plantedTrees: 0,
      playerName: "",
    };
  },

  getters: {},

  actions: {
    setStartingBlock(value: string) {
      this.startingBlock = value;
    },
    setStartingBlockDisplayment(state: boolean) {
      this.isStartingBlockDisplayed = state;
    },
    setMenuDisplayment(state: boolean) {
      this.isMenuDisplayed = state;
    },
    setCurrentWave(wave: number) {
      this.currentWave = wave;
    },
    setCurrentWaveDisplayment(state: boolean) {
      this.isCurrentWaveDisplayed = state;
    },
    incrementScore(value?: number) {
      if (value) {
        this.score += value;
      } else {
        this.score++;
      }
    },
    incrementDestroyedLumberjacks() {
      this.destroyedLumberjacks++;
    },
    incrementPlantedTrees() {
      this.plantedTrees++;
    },
    setPlayerName(name: string) {
      this.playerName = name;
    },
  },
});
