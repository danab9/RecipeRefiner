<template>
  <Home />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Home from "./views/Home.vue";
export default defineComponent({
  name: "App",
  components: { Home },
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
