<template>
  <v-container class="mt-10">
    <v-row>
      <v-col>
        <h1 class="text-center">Dana's app</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form ref="form" @submit.prevent="submitForm" v-model="valid">
          <v-text-field
            clearable
            label="Please enter URL"
            prepend-icon="mdi-silverware-fork-knife"
            variant="outlined"
            :rules="rules"
            v-model="URL"
          />
          <v-btn
            class="mt-2"
            type="submit"
            block
            :disabled="!valid"
            @click="submitUrl"
          >
            Submit
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
  <pre>{{ recipe }}</pre>
  <DogPicture />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DogPicture from "@/components/DogPicture.vue";
import axios from "axios";

type Recipe = {
  ingredients: string;
  instructions: string;
  title: string;
};

export default defineComponent({
  name: "MainHeader",
  components: { DogPicture },
  data() {
    return {
      recipe: {} as Recipe,
      URL: "",
      valid: false,
      rules: [
        (value: string) => {
          if (!value) return "You must enter a URL.";
          return this.isValidURL(value) || "Please enter a valid URL.";
        },
      ],
    };
  },
  computed: {},
  mounted() {},
  methods: {
    isValidURL(string: string): boolean {
      try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        return false;
      }
    },

    async submitForm() {
      // Validate the form before submission
      const isValid = await (this.$refs.form as any).validate();

      if (isValid.valid) {
        console.log("Valid URL submitted:", this.URL);
        // Add your submission logic here
        // Example: this.sendToAPI(this.URL);
      } else {
        console.log("Form validation failed");
      }
    },
    async submitUrl() {
      const response = await axios.post("http://localhost:8000/", {
        url: this.URL,
      });

      if (response.status === 200) {
        this.recipe = response.data.recipe;
      }

      console.log("response :>> ", response);
    },
  },
});
</script>

<style scoped></style>
