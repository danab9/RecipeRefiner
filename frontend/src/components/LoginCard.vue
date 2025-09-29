<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-8 pa-6">
          <v-card-title class="text-center text-h4 mb-6"> Login </v-card-title>

          <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
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

            <v-btn
              type="submit"
              :disabled="!valid || loading"
              :loading="loading"
              color="primary"
              size="large"
              block
              class="mb-4"
            >
              Login
            </v-btn>

            <div class="text-center">
              <span class="text-body-2">Already have an account?</span>
              <router-link to="/login" class="text-decoration-none ml-1">
                <v-btn
                  variant="text"
                  text="signup"
                  @click="$emit('changeView', 'signUp')"
                />
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
import { mapWritableState, mapActions } from "pinia";
import { useStore, type LoginPayload } from "../store/store";

export default defineComponent({
  name: "SignupView",
  emits: {
    changeView: (_newView: "signUp" | "login") => true,
  },
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
        password: "",
      } as LoginPayload,
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
          (v && v.length >= 3) || "Password must be at least 3 characters",
      ],
    };
  },
  computed: {
    ...mapWritableState(useStore, ["userName", "userId"]),

    confirmPasswordRules() {
      return [
        (v: string) => !!v || "Please confirm your password",
        (v: string) => v === this.formData.password || "Passwords do not match",
      ];
    },
  },
  methods: {
    ...mapActions(useStore, ["loginFunc"]),
    async handleLogin(): Promise<void> {
      if (!this.valid) return;

      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      await this.startSignup();
      this.loading = false;
    },

    async startSignup(): Promise<void> {
      const payload = {
        username: this.formData.username,
        password: this.formData.password,
      };

      try {
        const response = await this.loginFunc(payload);
        if (response.status === 200) {
          this.userName = response.data.username;
          this.userId = response.data.user_id;
          setTimeout(() => {
            this.$router.push("/");
          }, 500);
        }
      } catch (error: any) {
        this.errorMessage = error.response.data.error;
      }
    },

    resetForm(): void {
      this.formData = {
        username: "",
        password: "",
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
