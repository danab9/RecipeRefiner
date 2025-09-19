<template>
  <v-app>
    <v-main class="mx-auto" style="max-width: 1200px; min-width: 800px">
      <MainElement />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainElement from "../components/MainElement.vue";

export default defineComponent({
  name: "Home",
  components: { MainElement },
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
