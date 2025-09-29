<template>
  <LoginCard v-if="viewType === 'login'" @changeView="changeView" />
  <SignUpCard v-if="viewType === 'signUp'" @changeView="changeView" />
</template>

<script lang="ts">
import LoginCard from "@/components/LoginCard.vue";
import SignUpCard from "@/components/SignUpCard.vue";

import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { useStore } from "../store/store";

type ViewType = "signUp" | "login";
export default defineComponent({
  name: "LoginView",
  components: { LoginCard, SignUpCard },

  data() {
    return {
      viewType: "login" as ViewType,
    };
  },
  computed: {
    ...mapWritableState(useStore, ["userId"]),
  },
  methods: {
    changeView(newView: ViewType) {
      this.viewType = newView;
    },
  },
});
</script>

<style scoped></style>
