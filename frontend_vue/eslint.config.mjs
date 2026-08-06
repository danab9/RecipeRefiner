import pluginJs from "@eslint/js";
import configPrettier from "@vue/eslint-config-prettier";
import pluginCheckFile from "eslint-plugin-check-file";
import pluginCompat from "eslint-plugin-compat";
import pluginVue from "eslint-plugin-vue";
import pluginVuetify from "eslint-plugin-vuetify";
import globals from "globals";
import pluginTs from "typescript-eslint";

export default pluginTs.config(
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  {
    ignores: [
      "dist",
      "src/lib/particles.js",
      "eslint.config.mjs",
      "tests/**/*",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // we use process.env.NODE_ENV
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  pluginTs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".vue"],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginVue.configs["flat/recommended"],
  pluginVuetify.configs["flat/recommended"],
  configPrettier,
  pluginCompat.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: pluginTs.parser,
      },
    },
  },

  // override eslint-plugin-vuetify
  {
    rules: {
      "vuetify/grid-unknown-attributes": ["off"],
      "vue/no-v-html": "off",
    },
  },

  // override @eslint/js
  {
    rules: {
      "no-restricted-globals": [
        "warn",
        {
          name: "localStorage",
          message: "Use methods from our localStorage module instead",
        },
      ],
    },
  },

  // override @typescript-eslint
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // override eslint-plugin-vue
  {
    rules: {
      "vue/no-unused-properties": [
        "error",
        {
          groups: ["props", "data", "computed", "methods", "setup"], // by default, it checks `props` only
          deepData: true, // Checks nested properties in `data()`
          ignorePublicMembers: false, // Ignore public members starting with `_` or `$`
        },
      ],
      "vue/order-in-components": [
        "error",
        {
          order: [
            "el",
            "name",
            "key",
            "parent",
            "functional",
            ["delimiters", "comments"],
            ["components", "directives", "filters"],
            "extends",
            "mixins",
            ["provide", "inject"],
            "ROUTER_GUARDS",
            "layout",
            "middleware",
            "validate",
            "scrollToTop",
            "transition",
            "loading",
            "inheritAttrs",
            "model",
            ["props", "propsData"],
            "emits",
            "setup",
            "asyncData",
            "data",
            "fetch",
            "head",
            "computed",
            "LIFECYCLE_HOOKS",
            "watchQuery",
            "methods",
            "watch",
            ["template", "render"],
            "renderError",
          ],
        },
      ],
      "vue/valid-v-slot": ["error", { allowModifiers: true }],
      "vue/v-slot-style": [
        "error",
        {
          atComponent: "longform",
          default: "longform",
          named: "longform",
        },
      ],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
    },
  },

  // uncategorized eslint-plugin-vue rules, https://eslint.vuejs.org/rules/#uncategorized
  {
    rules: {
      // "vue/block-lang"                       // we use <script> with both js and ts at the moment
      "vue/block-order": ["error", { order: ["template", "script", "style"] }],
      "vue/block-tag-newline": [
        "error",
        { singleline: "always", multiline: "always" },
      ],
      "vue/component-api-style": ["error", ["options", "composition"]],
      "vue/component-name-in-template-casing": [
        "error",
        "kebab-case",
        { registeredComponentsOnly: false },
      ],
      "vue/component-options-name-casing": ["error", "PascalCase"],
      "vue/custom-event-name-casing": ["error", "camelCase"],
      // "vue/define-emits-declaration"         // we do not use <script setup>
      // "vue/define-macros-order"              // we do not use <script setup>
      // "vue/define-props-declaration"         // we do not use <script setup>
      "vue/enforce-style-attribute": ["error", { allow: ["scoped"] }],
      "vue/html-button-has-type": [
        "error",
        { button: true, submit: false, reset: false },
      ],
      "vue/html-comment-content-newline": [
        "error",
        { singleline: "never", multiline: "always" },
      ],
      "vue/html-comment-content-spacing": ["error", "always"],
      "vue/html-comment-indent": ["error", 2],
      "vue/match-component-file-name": [
        "error",
        { extensions: ["vue", "js"], shouldMatchCase: true },
      ],
      // "vue/match-component-import-name"          // weird rule, doesn't prevent incorrect component naming
      // "vue/max-lines-per-block"                  // we decide if the block is too long ourselves
      //"vue/max-lines-per-block": [
      //  "warn",
      //  { template: 300, script: 400, style: 100, skipBlankLines: true },
      //],
      // "vue/max-props"                            // not a real problem at the moment
      // "vue/new-line-between-multi-line-property" // not sure if we really want to enforce it
      "vue/next-tick-style": ["error", "promise"],

      // todo consider replacing with @intlify/eslint-plugin-vue-i18n
      "vue/no-bare-strings-in-template": [
        "error",
        // prettier-ignore
        {
          allowlist: [
            "❤️", "😌", "🥲", "☹️", "😤",
            "(", ")", ",", ".", "&", "+", "-", "=", "≈", "*", "/", "#", "%", "!", "?", ":", "[", "]", "{", "}", "<", ">", "\u00b7", "\u2022", "\u2010", "\u2013", "\u2014", "\u2212", "|", "Ø"
          ],
        },
      ],
      "vue/no-deprecated-model-definition": "error",
      // "vue/no-duplicate-attr-inheritance"      // we do not use v-bind="$attrs" usually
      "vue/no-empty-component-block": "off", // no strong opinion, turning off for now
      // "vue/no-multiple-objects-in-class"       // weird rule, not a real problem at the moment
      "vue/no-potential-component-option-typo": "error",
      "vue/no-ref-object-reactivity-loss": "error",
      "vue/no-required-prop-with-default": "error",
      // "vue/no-restricted-block"                // turn on when needed
      // "vue/no-restricted-call-after-await"     // turn on when needed
      // "vue/no-restricted-class"                // turn on when needed
      // "vue/no-restricted-component-names"      // turn on when needed
      // "vue/no-restricted-component-options"    // turn on when needed
      // "vue/no-restricted-custom-event"         // turn on when needed
      // "vue/no-restricted-html-elements"        // turn on when needed
      // "vue/no-restricted-props"                // turn on when needed
      // "vue/no-restricted-static-attribute"     // turn on when needed
      // "vue/no-restricted-v-bind"               // turn on when needed
      // "vue/no-restricted-v-on"                 // turn on when needed
      "vue/no-root-v-if": "error",
      "vue/no-setup-props-reactivity-loss": "error",
      // "vue/no-static-inline-styles"            // we do use inline styles
      // "vue/no-template-target-blank"           // the underlying vulnerability seems to be fixed in modern browsers
      "vue/no-this-in-before-route-enter": "error",
      // "vue/no-undef-components"                // we use global components
      // "vue/no-undef-properties"                // we use mixins
      // "vue/no-unsupported-features"            // we use the latest Vue
      "vue/no-unused-emit-declarations": "error",
      // "vue/no-unused-properties"               // we use mixins
      "vue/no-unused-refs": "error",
      "vue/no-use-v-else-with-v-for": "error",
      "vue/no-useless-mustaches": [
        "error",
        { ignoreIncludesComment: false, ignoreStringEscape: false },
      ],
      "vue/no-useless-v-bind": [
        "error",
        { ignoreIncludesComment: false, ignoreStringEscape: false },
      ],
      "vue/no-v-text": "error",
      "vue/padding-line-between-blocks": ["error", "always"],
      "vue/padding-line-between-tags": "off", // not sure if we really want to enforce it
      "vue/padding-lines-in-component-definition": [
        "error",
        {
          betweenOptions: "never",
          withinOption: "never",
          groupSingleLineProperties: true,
        },
      ],
      // "vue/prefer-prop-type-boolean-first"     // weird rule, not a real problem at the moment
      "vue/prefer-separate-static-class": "error",
      "vue/prefer-true-attribute-shorthand": ["warn", "always"],
      // "vue/require-default-export"     // not released as of 2024-08-22
      "vue/require-direct-export": "off", // we might want to use component instance before exporting
      "vue/require-emit-validator": "error",
      "vue/require-explicit-slots": "error",
      // "vue/require-expose"             // enabling it means adding 'expose' to every component
      // "vue/require-macro-variable-name"// we do not use <script setup>
      "vue/require-name-property": "off", // name property is inferred from the file name
      "vue/require-prop-comment": ["error", { type: "JSDoc" }],
      "vue/require-typed-object-prop": "error",
      "vue/require-typed-ref": "error",
      // "vue/script-indent"              // indentation is handled by prettier
      // "vue/sort-keys"                  // we might want to group keys by logic rather than alphabetically
      // "vue/static-class-names-order"   // we probably don't care about class order
      // "vue/v-for-delimiter-style"      // we use both 'in' and 'of' in v-for
      // "vue/v-if-else-key"              // not required in Vue 3
      // "vue/v-on-handler-style"         // rule not working properly - we cannot turn on both 'inline' and 'method'
      // "vue/valid-define-options"       // we do not use <script setup>
    },
  },

  // check if .ts files in 'types' folder end with 'Types'
  {
    plugins: { "check-file": pluginCheckFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "src/types/**/*.ts": "*Types" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
);
