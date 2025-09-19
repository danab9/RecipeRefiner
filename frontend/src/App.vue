<template>
  <main>
    <nav style="padding: 10px; background: #f0f0f0; margin-bottom: 20px">
      <router-link to="/" style="margin-right: 10px">Home</router-link>
      <router-link to="/login">Login</router-link>
    </nav>
    <RouterView />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
