<template>
  <v-container class="mt-10">
    <v-row>
      <v-col>
        <h1 class="text-center">Dana's Recipe Refiner</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-row class="d-flex align-center">
          <v-col cols="10">
            <v-text-field
              clearable
              label="Please enter URL"
              prepend-icon="mdi-silverware-fork-knife"
              variant="outlined"
              v-model="URL"
              hide-details
            />
          </v-col>
          <v-btn
            class="align-center"
            type="submit"
            :disabled="!isValidURL"
            @click="submitUrl"
            text="submit"
            height="56"
          />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <RecipeCard :recipe="recipe" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import RecipeCard from "./RecipeCard.vue";

type Recipe = {
  ingredients: string[];
  instructions: string;
  title: string;
};

export default defineComponent({
  name: "MainElement",
  components: { RecipeCard },
  data() {
    return {
      recipe: {} as Recipe,
      URL: "",
      isLoading: false,
    };
  },
  computed: {
    isValidURL(): boolean {
      try {
        const url = new URL(this.URL);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        return false;
      }
    },
  },
  mounted() {},
  methods: {
    async submitUrl() {
      const response = await axios.post("http://localhost:8000/", {
        url: this.URL,
      });

      if (response.status === 200) {
        this.recipe = response.data.recipe;
        this.URL = "";
      }

      console.log("response :>> ", response);
    },
  },
});
</script>

<style scoped></style>
