<template>
  <nav
    class="d-flex justify-space-between"
    style="padding: 10px; background: #f0f0f0; margin-bottom: 20px"
  >
    <div>
      <router-link to="/" style="margin-right: 10px">Home</router-link>
      <router-link v-if="userName === ''" to="/login">Login</router-link>
      <v-btn v-else @click="logoutFunc">Logout</v-btn>
    </div>
    <div>Hello {{ displayName }}</div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState, mapActions } from "pinia";
import { useStore } from "../store/store";

export default defineComponent({
  name: "MainNav",
  components: {},
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(useStore, ["userName"]),
    displayName() {
      return this.userName === "" ? "Gest" : this.userName;
    },
  },
  methods: {
    ...mapActions(useStore, ["signOutFunc"]),
    logoutFunc() {
      this.signOutFunc();
    },
  },
});
</script>

<style scoped></style>
