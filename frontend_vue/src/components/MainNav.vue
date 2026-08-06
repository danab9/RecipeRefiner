<template>
  <nav
    class="d-flex justify-space-between"
    style="padding: 10px; background: #f0f0f0; margin-bottom: 20px"
  >
    <div class="d-flex">
      <router-link to="/" style="margin-right: 10px">
        <v-btn>Home</v-btn>
      </router-link>
      <router-link
        v-if="isUserLoggedIn"
        to="/history"
        style="margin-right: 10px"
      >
        <v-btn class="d-flex align-center" outlined>
          <span class="ml-2">History</span>
          <v-badge :content="oldRecipes.length" color="grey" overlap>
            <template #badge>
              {{ oldRecipes.length }}
            </template>
            <v-icon size="large" icon="mdi-clipboard-text-clock" />
          </v-badge>
        </v-btn>
      </router-link>
    </div>

    <div class="d-flex align-center">
      <!-- Wait for checkUser() before rendering auth UI, so the nav doesn't
           flash "Login" for a logged-in user (or vice versa) on page load. -->
      <v-progress-circular
        v-if="!authResolved"
        indeterminate
        size="24"
        width="2"
      />
      <template v-else>
        <router-link v-if="!isUserLoggedIn" to="/login">
          <v-btn>Login</v-btn></router-link
        >

        <v-btn v-else @click="logoutFunc"> Logout</v-btn>
        <v-chip class="ml-3">Hello {{ displayName }}</v-chip>
      </template>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useStore } from "../store/store";

export default defineComponent({
  name: "MainNav",
  components: {},
  data() {
    return {};
  },
  computed: {
    ...mapState(useStore, [
      "userName",
      "isUserLoggedIn",
      "authResolved",
      "oldRecipes",
    ]),

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
