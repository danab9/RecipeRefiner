import { createWebHistory, createRouter } from "vue-router";

import Home from "../views/Home.vue";
import LoginView from "../views/LoginView.vue";

import History from "../views/History.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: LoginView },
  { path: "/history", name: "History", component: History },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
