<template>
  <RecipeCard v-for="recipes in oldRecipes" :recipe="recipes" />
</template>

<script lang="ts">
import { useStore, type Recipe } from "@/store/store";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import RecipeCard from "../components/RecipeCard.vue";
export default defineComponent({
  name: "history",
  components: { RecipeCard },
  data() {
    return {};
  },
  computed: {
    ...mapState(useStore, ["oldRecipes"]),
  },
  mounted() {
    this.getUserHistory();
  },

  methods: {
    ...mapActions(useStore, ["getUserHistory"]),
  },
});
</script>

<style scoped></style>
