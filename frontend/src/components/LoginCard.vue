<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-8 pa-6">
          <v-card-title class="text-center text-h4 mb-6">
            Sign Up
          </v-card-title>

          <v-form ref="form" v-model="valid" @submit.prevent="handleSignup">
            <v-text-field
              v-model="formData.username"
              :rules="usernameRules"
              label="Username"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              required
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.email"
              :rules="emailRules"
              label="Email (Optional)"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              type="email"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.password"
              :rules="passwordRules"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              required
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.confirmPassword"
              :rules="confirmPasswordRules"
              label="Confirm Password"
              prepend-inner-icon="mdi-lock-check"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="
                showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'
              "
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              variant="outlined"
              required
              class="mb-4"
            ></v-text-field>

            <v-btn
              type="submit"
              :disabled="!valid || loading"
              :loading="loading"
              color="primary"
              size="large"
              block
              class="mb-4"
            >
              Sign Up
            </v-btn>

            <div class="text-center">
              <span class="text-body-2">Already have an account?</span>
              <router-link to="/login" class="text-decoration-none ml-1">
                <span class="text-primary font-weight-medium">Sign In</span>
              </router-link>
            </div>
          </v-form>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="successMessage = ''"
          >
            {{ successMessage }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default defineComponent({
  name: "SignupView",
  data() {
    return {
      valid: false,
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      errorMessage: "",
      successMessage: "",
      formData: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      } as FormData,
      usernameRules: [
        (v: string) => !!v || "Username is required",
        (v: string) =>
          (v && v.length >= 3) || "Username must be at least 3 characters",
        (v: string) =>
          (v && v.length <= 20) || "Username must be less than 20 characters",
        (v: string) =>
          /^[a-zA-Z0-9_]+$/.test(v) ||
          "Username can only contain letters, numbers, and underscores",
      ],
      emailRules: [
        (v: string) => !v || /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      passwordRules: [
        (v: string) => !!v || "Password is required",
        (v: string) =>
          (v && v.length >= 6) || "Password must be at least 6 characters",
        (v: string) =>
          /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) ||
          "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ],
    };
  },
  computed: {
    confirmPasswordRules() {
      return [
        (v: string) => !!v || "Please confirm your password",
        (v: string) => v === this.formData.password || "Passwords do not match",
      ];
    },
  },
  methods: {
    async handleSignup(): Promise<void> {
      if (!this.valid) return;

      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        // Simulate API call
        await this.simulateSignup();

        this.successMessage = "Account created successfully! Please sign in.";

        // Reset form after successful signup
        setTimeout(() => {
          this.resetForm();
          // Optionally redirect to login page
          this.$router.push("/login");
        }, 2000);
      } catch (error) {
        this.errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during signup";
      } finally {
        this.loading = false;
      }
    },

    async simulateSignup(): Promise<void> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate potential errors
      if (this.formData.username === "admin") {
        throw new Error("Username is already taken");
      }

      if (this.formData.email && this.formData.email === "test@test.com") {
        throw new Error("Email is already registered");
      }

      // Here you would normally make an API call to create the user
      console.log("Creating user:", {
        username: this.formData.username,
        email: this.formData.email || null,
        // Never log actual passwords in production!
      });
    },

    resetForm(): void {
      this.formData = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      };
      this.valid = false;
      this.showPassword = false;
      this.showConfirmPassword = false;

      // Reset form validation
      if (this.$refs.form) {
        (this.$refs.form as any).reset();
      }
    },
  },
});
</script>

<style scoped></style>
