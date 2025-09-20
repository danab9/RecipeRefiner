import { defineStore } from "pinia";

type StoreType = {
  userId: null | number;
  userName: string;
};

export const useStore = defineStore("store", {
  state: (): StoreType => ({ userId: null, userName: "" }),
  getters: {},
  actions: {},
});
