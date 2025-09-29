<template>
  <div v-if="recipe?.title">
    <v-card class="recipe-card" elevation="4" rounded="lg">
      <!-- Header Section -->
      <v-card-title class="recipe-header pa-6 pb-4">
        <div class="d-flex align-center">
          <v-icon color="primary" size="28" class="me-3">mdi-chef-hat</v-icon>
          <h1 class="text-h4 font-weight-bold text-primary">
            {{ recipe.title }}
          </h1>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Content Section -->
      <v-card-text class="pa-0">
        <v-row no-gutters>
          <!-- Ingredients Section -->
          <v-col cols="12" md="5" class="ingredients-section">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon color="success" size="24" class="me-2"
                  >mdi-format-list-bulleted</v-icon
                >
                <h2 class="text-h5 font-weight-medium text-success">
                  Ingredients
                </h2>
              </div>

              <v-list class="ingredient-list" density="comfortable">
                <v-list-item
                  v-for="(ingredient, index) in recipe.ingredients"
                  :key="index"
                  class="ingredient-item px-0"
                  @click="toggleIngredient(index)"
                  :class="{ 'ingredient-checked': checkedIngredients[index] }"
                  style="cursor: pointer"
                >
                  <template #prepend>
                    <v-icon
                      :color="
                        checkedIngredients[index] ? 'success' : 'grey-lighten-1'
                      "
                      size="20"
                      class="me-3"
                    >
                      {{
                        checkedIngredients[index]
                          ? "mdi-check-circle"
                          : "mdi-circle-outline"
                      }}
                    </v-icon>
                  </template>
                  <v-list-item-title
                    class="text-body-1"
                    :class="{
                      'text-decoration-line-through text-medium-emphasis':
                        checkedIngredients[index],
                    }"
                  >
                    {{ ingredient }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-col>

          <!-- Divider for larger screens -->
          <v-divider vertical class="d-none d-md-block"></v-divider>
          <v-divider class="d-block d-md-none"></v-divider>

          <!-- Instructions Section -->
          <v-col cols="12" md="7" class="instructions-section">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon color="warning" size="24" class="me-2"
                  >mdi-file-document-outline</v-icon
                >
                <h2 class="text-h5 font-weight-medium text-warning">
                  Instructions
                </h2>
              </div>

              <div class="instructions-content">
                <p class="text-body-1 line-height-relaxed">
                  {{ recipe.instructions }}
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Footer Section -->
      <v-divider></v-divider>
      <v-card-actions class="pa-4 justify-center">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-heart-outline"
          size="large"
          class="me-2"
        >
          Save Recipe
        </v-btn>
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-share-variant"
          size="large"
        >
          Share
        </v-btn>
      </v-card-actions>
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
      required: true,
    },
  },
  data() {
    return {
      checkedIngredients: {} as Record<number, boolean>,
    };
  },
  computed: {},
  methods: {
    toggleIngredient(index: number) {
      this.checkedIngredients = {
        ...this.checkedIngredients,
        [index]: !this.checkedIngredients[index],
      };
    },
  },
});
</script>

<style scoped>
.recipe-card {
  max-width: 1000px;
  margin: 0 auto;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.recipe-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-bottom: 2px solid rgba(25, 118, 210, 0.12);
}

.ingredients-section {
  background-color: rgba(76, 175, 80, 0.02);
}

.instructions-section {
  background-color: rgba(255, 152, 0, 0.02);
}

.ingredient-list {
  background: transparent;
}

.ingredient-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.ingredient-item:hover {
  background-color: rgba(76, 175, 80, 0.08);
}

.ingredient-checked {
  background-color: rgba(76, 175, 80, 0.05);
}

.instructions-content {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #ff9800;
}

.line-height-relaxed {
  line-height: 1.7;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .recipe-header {
    padding: 16px !important;
  }

  .recipe-header h1 {
    font-size: 1.5rem !important;
  }

  .ingredients-section,
  .instructions-section {
    padding: 16px;
  }
}
</style>
