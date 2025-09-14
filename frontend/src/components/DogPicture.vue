Here's the complete solution using Options API: vue
<template>
  <div>
    <v-progress-circular
      v-if="loading"
      :size="50"
      color="primary"
      indeterminate
    />
    <v-img
      v-if="imgSrc.length > 0"
      :width="300"
      aspect-ratio="16/9"
      cover
      :src="imgSrc"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";

export default defineComponent({
  name: "DogPicture",
  components: {},
  data() {
    return {
      imgSrc: "",
      loading: true,
    };
  },
  computed: {},
  async mounted() {
    await this.getDogPicture();
  },
  methods: {
    async getDogPicture() {
      try {
        this.loading = true;
        const response = await axios.get(
          "https://dog.ceo/api/breed/beagle/images/random"
        );
        this.imgSrc = response.data.message;
        // Note: loading will be set to false in onImageLoad
      } catch (error) {
        console.error("Failed to fetch dog picture:", error);
        this.loading = false;
      }
    },
    onImageLoad() {
      this.loading = false;
    },
    onImageError() {
      console.error("Failed to load image");
      this.loading = false;
      // Optionally set a fallback image or show error message
    },
  },
});
</script>

<style scoped></style>
