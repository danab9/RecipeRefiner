import { defineStore } from "pinia";
import axios from "axios";

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

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
  oldRecipes: Recipe[];
};

export type Recipe = {
  ingredients: string[];
  instructions: string;
  title: string;
  id: number;
};

// Utility to get CSRF token from cookie
function getCsrfTokenFromCookie(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

export const useStore = defineStore("store", {
  state: (): StoreType => ({
    userId: localStorage.getItem("userId")
      ? Number(localStorage.getItem("userId"))
      : null,
    userName: localStorage.getItem("userName") || "",
    oldRecipes: [],
  }),
  getters: {
    isUserLoggedIn(state) {
      return state.userId && state.userName;
    },
  },
  actions: {
    async loginFunc(payload: LoginPayload) {
      const response = await axios.post(
        "http://localhost:8000/login/",
        payload,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": getCsrfTokenFromCookie() || "",
          },
        }
      );
      // Save user info to localStorage for persistence
      if (response.status === 200 && response.data) {
        this.userId = response.data.user_id;
        this.userName = response.data.username;
        localStorage.setItem("userId", String(this.userId));
        localStorage.setItem("userName", this.userName);
      }
      return response;
    },
    async signOutFunc() {
      const response = await axios.post(
        "http://localhost:8000/logout/",
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": getCsrfTokenFromCookie() || "",
          },
        }
      );
      // Clear user data after logout
      this.userId = null;
      this.userName = "";
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      return response;
    },
    async registerFunc(payload: RegisterPayload) {
      const response = await axios.post(
        "http://localhost:8000/register/",
        payload,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": getCsrfTokenFromCookie() || "",
          },
        }
      );
      // Save user info to localStorage for persistence
      if (
        (response.status === 201 || response.status === 200) &&
        response.data
      ) {
        this.userId = response.data.user_id;
        this.userName = response.data.username;
        localStorage.setItem("userId", String(this.userId));
        localStorage.setItem("userName", this.userName);
      }
      return response;
    },

    async getRecipe(url: string) {
      const response = await axios.post(
        "http://localhost:8000/",
        { url: url },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": getCsrfTokenFromCookie() || "",
          },
        }
      );
      return response;
    },

    async getUserHistory() {
      // Use GET request to match the API view's @api_view(["GET"]) decorator
      const response = await axios.get("http://localhost:8000/history/", {
        withCredentials: true,
        headers: {
          "X-CSRFToken": getCsrfTokenFromCookie() || "",
        },
      });
      if (response.status === 200) {
        this.oldRecipes = response.data.recipes;
      }
    },

    async deleteRecipe(recipeId: number) {
      const response = await axios.delete(
        `http://localhost:8000/delete/${recipeId}`,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": getCsrfTokenFromCookie() || "",
          },
        }
      );
      if (response.status === 204) {
        await this.getUserHistory();
      }
    },
  },
});
