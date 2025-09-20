import { defineStore } from "pinia";

export const useStore = defineStore("store", {
  state: () => ({ userId: -1, userName: "" }),
  getters: {},
  actions: {},
});
