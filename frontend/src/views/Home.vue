<template>
  <v-app>
    <v-main>
      <MainHeader />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainHeader from "../components/MainHeader.vue";

export default defineComponent({
  name: "Home",
  components: { MainHeader },
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
