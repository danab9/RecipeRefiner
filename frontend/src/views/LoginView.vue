<template>
  <LoginCard />
</template>

<script lang="ts">
import LoginCard from "@/components/LoginCard.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginView",
  components: { LoginCard },
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
