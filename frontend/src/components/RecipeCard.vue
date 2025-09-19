<template>
  <div v-if="recipe?.title">
    <v-card :title="recipe.title" variant="outlined">
      <v-row>
        <v-col>
          <v-list density="compact" :items="recipe.ingredients"></v-list>
        </v-col>
        <v-col>
          <p class="text-h5">{{ recipe.instructions }}</p>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
type Recipe = {
  ingredients: string[];
  instructions: string;
  title: string;
};
export default defineComponent({
  name: "RecipeCard",
  components: {},
  props: {
    recipe: {
      type: Object as PropType<Recipe>,
    },
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
});
</script>

<style scoped></style>
