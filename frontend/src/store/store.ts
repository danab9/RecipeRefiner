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
  csrfToken: string | null;
  oldRecipes: Recipe[];
};

export type Recipe = {
  ingredients: string[];
  instructions: string;
  title: string;
  id: number;
};

export const useStore = defineStore("store", {
  state: (): StoreType => ({
    userId: null,
    userName: "",
    csrfToken: null,
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
        { withCredentials: true } // Ensure cookies are sent/received
      );

      // Inspect cookies
      console.log("All cookies:", document.cookie);

      // Extract CSRF token if present
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
          this.csrfToken = value;
          console.log("Found CSRF token:", value);

          // Set the CSRF token for future requests
          axios.defaults.headers.common["X-CSRFToken"] = value;
        }
      }

      // Also check response headers for CSRF token
      const csrfHeader =
        response.headers["x-csrftoken"] || response.headers["X-CSRFTOKEN"];
      if (csrfHeader) {
        console.log("CSRF token from headers:", csrfHeader);
        this.csrfToken = csrfHeader;
        axios.defaults.headers.common["X-CSRFToken"] = csrfHeader;
      }

      return response;
    },
    async signOutFunc() {
      // Ensure we have the CSRF token from cookies if not already set
      if (!this.csrfToken) {
        // Extract CSRF token from cookies
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "csrftoken") {
            this.csrfToken = value;
            console.log("Found CSRF token for logout:", value);
            axios.defaults.headers.common["X-CSRFToken"] = value;
          }
        }
      }

      // Set CSRF token in headers if available
      const headers: Record<string, string> = {};
      if (this.csrfToken) {
        headers["X-CSRFToken"] = this.csrfToken;
      }

      const response = await axios.post(
        "http://localhost:8000/logout/",
        {}, // empty body
        {
          withCredentials: true,
          headers,
        }
      );

      // Clear user data after logout
      this.userId = null;
      this.userName = "";

      return response;
    },
    async registerFunc(payload: RegisterPayload) {
      // For registration, we might not have a CSRF token yet (new user)
      // But we'll check anyway in case we're on a page that already set it
      if (!this.csrfToken) {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "csrftoken") {
            this.csrfToken = value;
            console.log("Found CSRF token for registration:", value);
            axios.defaults.headers.common["X-CSRFToken"] = value;
          }
        }
      }

      const headers: Record<string, string> = {};
      if (this.csrfToken) {
        headers["X-CSRFToken"] = this.csrfToken;
      }

      const response = await axios.post(
        "http://localhost:8000/register/",
        payload,
        {
          withCredentials: true,
          headers,
        }
      );

      // Check if we got a CSRF token in the response
      const csrfHeader =
        response.headers["x-csrftoken"] || response.headers["X-CSRFTOKEN"];
      if (csrfHeader) {
        console.log("CSRF token from registration response:", csrfHeader);
        this.csrfToken = csrfHeader;
        axios.defaults.headers.common["X-CSRFToken"] = csrfHeader;
      }

      return response;
    },

    async getRecipe(url: string) {
      const response = await axios.post("http://localhost:8000/", {
        url: url,
      });

      return response;
    },

    async getUserHistory() {
      // Use GET request to match the API view's @api_view(["GET"]) decorator
      const response = await axios.get("http://localhost:8000/history/", {
        withCredentials: true, // Ensure cookies/session are sent
        headers: {
          "X-CSRFToken": this.csrfToken || "", // Include CSRF token if available
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
          withCredentials: true, // Ensure cookies/session are sent
          headers: {
            "X-CSRFToken": this.csrfToken || "", // Include CSRF token if available
          },
        }
      );
      if (response.status === 204) {
        await this.getUserHistory();
      }
    },
  },
});
