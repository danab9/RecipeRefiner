<template>
  <nav
    class="d-flex justify-space-between"
    style="padding: 10px; background: #f0f0f0; margin-bottom: 20px"
  >
    <div>
      <router-link to="/" style="margin-right: 10px">
        <v-btn>Home</v-btn>
      </router-link>
      <router-link v-if="userName === ''" to="/login">
        <v-btn>Login</v-btn></router-link
      >
      <v-btn v-else @click="logoutFunc"> Logout</v-btn>
    </div>
    <router-link v-if="isUserLoggedIn" to="/history" style="margin-right: 10px">
      <v-btn>History</v-btn>
    </router-link>

    <div>Hello {{ displayName }}</div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState, mapActions, mapState } from "pinia";
import { useStore } from "../store/store";

export default defineComponent({
  name: "MainNav",
  components: {},
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(useStore, ["userName"]),
    ...mapState(useStore, ["isUserLoggedIn"]),

    displayName() {
      return this.userName === "" ? "Guest" : this.userName;
    },
  },
  methods: {
    ...mapActions(useStore, ["signOutFunc"]),
    logoutFunc() {
      this.$router.push("/");
      this.signOutFunc();
    },
  },
});
</script>

<style scoped></style>
