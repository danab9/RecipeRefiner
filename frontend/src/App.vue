<template>
  <main>
    <MainNav />
    <RouterView />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainNav from "../src/components/MainNav.vue";
import { useStore } from "./store/store.ts";
import { mapActions } from "pinia";

export default defineComponent({
  name: "App",
  components: { MainNav },
  data() {
    return {};
  },
  computed: {},
  async mounted() {
    await this.checkUser();
  },
  methods: {
    ...mapActions(useStore, ["checkUser"]),
  },
});
</script>

<style scoped></style>
