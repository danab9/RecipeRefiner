import { defineStore } from "pinia";
import axios from "axios";

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
export type LoginPayload = {
  username: string;
  password: string;
};

type StoreType = {
  userId: null | number;
  userName: string;
};

export const useStore = defineStore("store", {
  state: (): StoreType => ({ userId: null, userName: "" }),
  getters: {},
  actions: {
    async loginFunc(payload: LoginPayload) {
      const response = await axios.post(
        "http://localhost:8000/login/",
        payload
      );
      return response;
    },
    async signOutFunc() {
      const response = await axios.post("http://localhost:8000/logout/");
      return response;
    },
    async registerFunc(payload: RegisterPayload) {
      const response = await axios.post(
        "http://localhost:8000/register/",
        payload
      );
      return response;
    },
  },
});
