<template>
  <RecipeCard v-for="recipes in oldRecipes" :recipe="recipes" />
</template>

<script lang="ts">
import { useStore } from "@/store/store";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import RecipeCard from "../components/RecipeCard.vue";
export default defineComponent({
  name: "history",
  components: { RecipeCard },
  data() {
    return {
      oldRecipes: [],
    };
  },
  computed: {},
  async mounted() {
    this.oldRecipes = await this.getUserHistory();
  },
  methods: {
    ...mapActions(useStore, ["getUserHistory"]),
  },
});
</script>

<style scoped></style>
