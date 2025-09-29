<template>
  <main>
    <MainNav />
    <RouterView />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainNav from "../src/components/MainNav.vue";

export default defineComponent({
  name: "App",
  components: { MainNav },
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
