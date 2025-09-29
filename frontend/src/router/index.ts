import { createMemoryHistory, createRouter } from "vue-router";

import Home from "../views/Home.vue";
import LoginView from "../views/LoginView.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: LoginView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
